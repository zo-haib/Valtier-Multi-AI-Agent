"""Document loader: Document -> Text Extraction, for PDF/DOCX/TXT/CSV."""
from __future__ import annotations

from pathlib import Path


def load_txt(path: str) -> str:
    text = Path(path).read_text(encoding="utf-8", errors="ignore")
    if not text.strip():
        raise ValueError(f"Text file is empty: {path}")
    return text


def load_csv(path: str) -> str:
    import pandas as pd

    df = pd.read_csv(path)
    if df.empty:
        raise ValueError(f"CSV file is empty: {path}")
    lines = [", ".join(df.columns.astype(str))]
    for _, row in df.iterrows():
        lines.append(", ".join(str(v) for v in row.values))
    return "\n".join(lines)


def load_pdf(path: str) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise ImportError("pypdf is required to load PDF files.") from exc

    reader = PdfReader(path)
    text = "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    if not text:
        raise ValueError(f"No extractable text found in PDF: {path}")
    return text


def load_docx(path: str) -> str:
    try:
        import docx
    except ImportError as exc:
        raise ImportError("python-docx is required to load DOCX files.") from exc

    document = docx.Document(path)
    text = "\n".join(p.text for p in document.paragraphs if p.text.strip())
    if not text.strip():
        raise ValueError(f"No extractable text found in DOCX: {path}")
    return text


_LOADERS = {".txt": load_txt, ".csv": load_csv, ".pdf": load_pdf, ".docx": load_docx}


def load_document(path: str) -> str:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Document not found: {path}")
    ext = file_path.suffix.lower()
    loader = _LOADERS.get(ext)
    if loader is None:
        raise ValueError(f"Unsupported document type '{ext}' for {path}")
    return loader(path)


def split_text(text: str, chunk_size: int = 800, chunk_overlap: int = 120) -> list[str]:
    """Chunking stage: Text -> Chunks."""
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    if not text or not text.strip():
        raise ValueError("Cannot split empty text")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap, separators=["\n\n", "\n", ". ", " ", ""]
    )
    return [chunk for chunk in splitter.split_text(text) if chunk.strip()]
