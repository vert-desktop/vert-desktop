use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;
use uuid::Uuid;

use crate::error::{AppError, Result};

#[derive(Debug, serde::Deserialize)]
pub struct ConvertRequest {
    pub input_path: String,
    pub output_format: String,
    pub options: ConvertOptions,
}

#[derive(Debug, serde::Deserialize)]
pub struct ConvertOptions {
    pub quality: Option<u8>,
    pub audio_bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub preserve_metadata: Option<bool>,
}

#[derive(Debug, serde::Serialize)]
pub struct ConvertResult {
    pub output_path: String,
    pub size_bytes: u64,
}

fn make_output_filename(output_format: &str) -> String {
    format!("{}.{}", Uuid::new_v4(), output_format)
}

fn detect_category(extension: &str) -> &'static str {
    match extension.to_lowercase().as_str() {
        "mp3" | "wav" | "flac" | "ogg" | "opus" | "aac" | "alac" | "m4a" | "wma" | "aiff"
        | "mp2" | "au" | "m4b" | "voc" => "audio",
        "mp4" | "mkv" | "webm" | "avi" | "mov" | "wmv" | "mts" | "ts" | "m2ts" | "mpg" | "mpeg"
        | "flv" | "vob" | "m4v" | "3gp" | "ogv" => "video",
        "docx" | "doc" | "md" | "html" | "rtf" | "csv" | "rst" | "epub" | "odt" => "document",
        _ => "image",
    }
}

#[tauri::command]
pub async fn convert_file(
    app: AppHandle,
    request: ConvertRequest,
) -> std::result::Result<ConvertResult, AppError> {
    let input_path = PathBuf::from(&request.input_path);

    let input_ext = input_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let category = detect_category(&input_ext);
    let output_format = request.output_format.to_lowercase();

    let tmp_dir = tempfile::tempdir().map_err(AppError::from)?;
    let output_filename = make_output_filename(&output_format);
    let output_path = tmp_dir.path().join(&output_filename);

    match category {
        "image" => convert_image(&app, &input_path, &output_path, &request.options).await?,
        "audio" => convert_audio(&app, &input_path, &output_path, &request.options).await?,
        "video" => convert_video(&app, &input_path, &output_path, &request.options).await?,
        "document" => convert_document(&app, &input_path, &output_path).await?,
        _ => return Err(AppError::UnsupportedFormat(input_ext)),
    }

    let size_bytes = std::fs::metadata(&output_path)
        .map_err(AppError::from)?
        .len();

    // Move output to a stable temp location before the tmp_dir is dropped
    let stable_output = std::env::temp_dir().join(&output_filename);
    std::fs::copy(&output_path, &stable_output).map_err(AppError::from)?;

    Ok(ConvertResult {
        output_path: stable_output.to_string_lossy().to_string(),
        size_bytes,
    })
}

fn build_image_args(input: &Path, output: &Path, opts: &ConvertOptions) -> Vec<String> {
    let quality = opts.quality.unwrap_or(92).to_string();
    vec![
        input.to_string_lossy().to_string(),
        "-quality".into(),
        quality,
        output.to_string_lossy().to_string(),
    ]
}

fn build_audio_args(input: &Path, output: &Path, opts: &ConvertOptions) -> Vec<String> {
    let mut args: Vec<String> = vec![
        "-i".into(),
        input.to_string_lossy().to_string(),
        "-y".into(),
    ];

    if let Some(bitrate) = opts.audio_bitrate {
        args.push("-b:a".into());
        args.push(format!("{}k", bitrate));
    }

    if let Some(sample_rate) = opts.sample_rate {
        args.push("-ar".into());
        args.push(sample_rate.to_string());
    }

    if opts.preserve_metadata.unwrap_or(true) {
        args.push("-map_metadata".into());
        args.push("0".into());
    }

    args.push(output.to_string_lossy().to_string());
    args
}

fn build_video_args(input: &Path, output: &Path, opts: &ConvertOptions) -> Vec<String> {
    let mut args: Vec<String> = vec![
        "-i".into(),
        input.to_string_lossy().to_string(),
        "-y".into(),
    ];

    if opts.preserve_metadata.unwrap_or(true) {
        args.push("-map_metadata".into());
        args.push("0".into());
    }

    args.push(output.to_string_lossy().to_string());
    args
}

fn build_document_args(input: &Path, output: &Path) -> Vec<String> {
    vec![
        input.to_string_lossy().to_string(),
        "-o".into(),
        output.to_string_lossy().to_string(),
    ]
}

async fn run_sidecar(app: &AppHandle, name: &str, args: Vec<String>) -> Result<()> {
    let result = app
        .shell()
        .sidecar(name)
        .map_err(|e| AppError::SidecarNotFound(e.to_string()))?
        .args(args)
        .output()
        .await
        .map_err(|e| AppError::ProcessError(e.to_string()))?;

    if !result.status.success() {
        return Err(AppError::ConversionFailed(
            String::from_utf8_lossy(&result.stderr).to_string(),
        ));
    }

    Ok(())
}

async fn convert_image(
    app: &AppHandle,
    input: &Path,
    output: &Path,
    opts: &ConvertOptions,
) -> Result<()> {
    run_sidecar(
        app,
        "vert-desktop-magick",
        build_image_args(input, output, opts),
    )
    .await
}

async fn convert_audio(
    app: &AppHandle,
    input: &Path,
    output: &Path,
    opts: &ConvertOptions,
) -> Result<()> {
    run_sidecar(
        app,
        "vert-desktop-ffmpeg",
        build_audio_args(input, output, opts),
    )
    .await
}

async fn convert_video(
    app: &AppHandle,
    input: &Path,
    output: &Path,
    opts: &ConvertOptions,
) -> Result<()> {
    run_sidecar(
        app,
        "vert-desktop-ffmpeg",
        build_video_args(input, output, opts),
    )
    .await
}

async fn convert_document(app: &AppHandle, input: &Path, output: &Path) -> Result<()> {
    run_sidecar(
        app,
        "vert-desktop-pandoc",
        build_document_args(input, output),
    )
    .await
}

#[tauri::command]
pub async fn save_file(from: String, to: String) -> std::result::Result<(), AppError> {
    std::fs::copy(&from, &to)
        .map(|_| ())
        .map_err(AppError::from)
}

#[tauri::command]
pub async fn get_file_info(path: String) -> std::result::Result<FileInfo, AppError> {
    let path = PathBuf::from(&path);
    let meta = std::fs::metadata(&path).map_err(AppError::from)?;

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let category = detect_category(&ext);

    Ok(FileInfo {
        name: path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string(),
        size_bytes: meta.len(),
        extension: ext,
        category: category.to_string(),
    })
}

#[derive(Debug, serde::Serialize)]
pub struct FileInfo {
    pub name: String,
    pub size_bytes: u64,
    pub extension: String,
    pub category: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_category_audio() {
        assert_eq!(detect_category("mp3"), "audio");
        assert_eq!(detect_category("MP3"), "audio");
        assert_eq!(detect_category("flac"), "audio");
        assert_eq!(detect_category("wav"), "audio");
        assert_eq!(detect_category("ogg"), "audio");
    }

    #[test]
    fn test_detect_category_video() {
        assert_eq!(detect_category("mp4"), "video");
        assert_eq!(detect_category("mkv"), "video");
        assert_eq!(detect_category("avi"), "video");
        assert_eq!(detect_category("webm"), "video");
    }

    #[test]
    fn test_detect_category_document() {
        assert_eq!(detect_category("docx"), "document");
        assert_eq!(detect_category("md"), "document");
        assert_eq!(detect_category("epub"), "document");
        assert_eq!(detect_category("html"), "document");
    }

    #[test]
    fn test_detect_category_image() {
        assert_eq!(detect_category("png"), "image");
        assert_eq!(detect_category("jpg"), "image");
        assert_eq!(detect_category("webp"), "image");
        assert_eq!(detect_category("svg"), "image");
    }

    #[test]
    fn test_detect_category_unknown_is_image() {
        assert_eq!(detect_category("xyz"), "image");
        assert_eq!(detect_category(""), "image");
    }

    // ── make_output_filename ────────────────────────────────────────────────

    #[test]
    fn test_make_output_filename_uses_the_requested_extension() {
        let filename = make_output_filename("webp");
        assert!(filename.ends_with(".webp"));
    }

    #[test]
    fn test_make_output_filename_is_unique() {
        let a = make_output_filename("png");
        let b = make_output_filename("png");
        assert_ne!(a, b);
    }

    // ── build_image_args ────────────────────────────────────────────────────

    #[test]
    fn test_build_image_args_default_quality() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: None,
        };
        let args = build_image_args(Path::new("in.png"), Path::new("out.webp"), &opts);
        assert_eq!(args, vec!["in.png", "-quality", "92", "out.webp"]);
    }

    #[test]
    fn test_build_image_args_custom_quality() {
        let opts = ConvertOptions {
            quality: Some(50),
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: None,
        };
        let args = build_image_args(Path::new("in.png"), Path::new("out.webp"), &opts);
        assert_eq!(args, vec!["in.png", "-quality", "50", "out.webp"]);
    }

    // ── build_audio_args ────────────────────────────────────────────────────

    #[test]
    fn test_build_audio_args_defaults_preserve_metadata() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: None,
        };
        let args = build_audio_args(Path::new("in.wav"), Path::new("out.mp3"), &opts);
        assert_eq!(
            args,
            vec!["-i", "in.wav", "-y", "-map_metadata", "0", "out.mp3"]
        );
    }

    #[test]
    fn test_build_audio_args_with_bitrate_and_sample_rate() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: Some(192),
            sample_rate: Some(44100),
            preserve_metadata: Some(true),
        };
        let args = build_audio_args(Path::new("in.wav"), Path::new("out.mp3"), &opts);
        assert_eq!(
            args,
            vec![
                "-i",
                "in.wav",
                "-y",
                "-b:a",
                "192k",
                "-ar",
                "44100",
                "-map_metadata",
                "0",
                "out.mp3"
            ]
        );
    }

    #[test]
    fn test_build_audio_args_metadata_disabled() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: Some(false),
        };
        let args = build_audio_args(Path::new("in.wav"), Path::new("out.mp3"), &opts);
        assert_eq!(args, vec!["-i", "in.wav", "-y", "out.mp3"]);
    }

    // ── build_video_args ────────────────────────────────────────────────────

    #[test]
    fn test_build_video_args_defaults_preserve_metadata() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: None,
        };
        let args = build_video_args(Path::new("in.mov"), Path::new("out.mp4"), &opts);
        assert_eq!(
            args,
            vec!["-i", "in.mov", "-y", "-map_metadata", "0", "out.mp4"]
        );
    }

    #[test]
    fn test_build_video_args_metadata_disabled() {
        let opts = ConvertOptions {
            quality: None,
            audio_bitrate: None,
            sample_rate: None,
            preserve_metadata: Some(false),
        };
        let args = build_video_args(Path::new("in.mov"), Path::new("out.mp4"), &opts);
        assert_eq!(args, vec!["-i", "in.mov", "-y", "out.mp4"]);
    }

    // ── build_document_args ─────────────────────────────────────────────────

    #[test]
    fn test_build_document_args() {
        let args = build_document_args(Path::new("in.md"), Path::new("out.docx"));
        assert_eq!(args, vec!["in.md", "-o", "out.docx"]);
    }

    // ── get_file_info ────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_get_file_info_reads_name_size_and_category() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("photo.PNG");
        std::fs::write(&path, b"fake image bytes").unwrap();

        let info = get_file_info(path.to_string_lossy().to_string())
            .await
            .unwrap();

        assert_eq!(info.name, "photo.PNG");
        assert_eq!(info.extension, "png");
        assert_eq!(info.category, "image");
        assert_eq!(info.size_bytes, "fake image bytes".len() as u64);
    }

    #[tokio::test]
    async fn test_get_file_info_missing_file_is_an_error() {
        let result = get_file_info("/no/such/file.png".to_string()).await;
        assert!(matches!(result, Err(AppError::Io(_))));
    }

    // ── save_file ────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_save_file_copies_content() {
        let dir = tempfile::tempdir().unwrap();
        let from = dir.path().join("source.txt");
        let to = dir.path().join("dest.txt");
        std::fs::write(&from, b"hello").unwrap();

        save_file(
            from.to_string_lossy().to_string(),
            to.to_string_lossy().to_string(),
        )
        .await
        .unwrap();

        assert_eq!(std::fs::read(&to).unwrap(), b"hello");
    }

    #[tokio::test]
    async fn test_save_file_missing_source_is_an_error() {
        let dir = tempfile::tempdir().unwrap();
        let to = dir.path().join("dest.txt");

        let result = save_file(
            "/no/such/source.txt".to_string(),
            to.to_string_lossy().to_string(),
        )
        .await;

        assert!(matches!(result, Err(AppError::Io(_))));
    }
}
