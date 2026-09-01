"""
Regression tests for the QA-audit security fixes:
  - real file-signature (MIME) validation on upload, not just extension
  - arbitrary local file read via a spoofed csv_path is refused
  - orchestrator dedupes agent lists and enforces a hard dispatch cap
"""
from __future__ import annotations

import io

from app.agents.data_processing import DataProcessingAgent, _resolve_trusted_csv_path
from app.agents.orchestrator import _dedupe_preserve_order
from app.agents.schemas import AgentName
from app.services.rag_service import _validate_upload


class _FakeUploadFile:
    def __init__(self, filename: str):
        self.filename = filename


def test_pdf_with_wrong_signature_is_rejected():
    fake_pdf = _FakeUploadFile("malware.pdf")
    from app.core.exceptions import AppError
    import pytest

    with pytest.raises(AppError, match="does not match"):
        _validate_upload(fake_pdf, b"this is not a real PDF, just renamed")


def test_real_pdf_signature_is_accepted():
    fake_pdf = _FakeUploadFile("real.pdf")
    ext = _validate_upload(fake_pdf, b"%PDF-1.4\n%mock pdf content")
    assert ext == ".pdf"


def test_docx_zip_signature_is_accepted():
    fake_docx = _FakeUploadFile("real.docx")
    ext = _validate_upload(fake_docx, b"PK\x03\x04mock zip content")
    assert ext == ".docx"


def test_binary_content_rejected_for_txt_extension():
    fake_txt = _FakeUploadFile("notes.txt")
    from app.core.exceptions import AppError
    import pytest

    with pytest.raises(AppError, match="does not match"):
        _validate_upload(fake_txt, b"\x00\x01\x02binary garbage\x00")


def test_empty_file_rejected():
    fake_txt = _FakeUploadFile("empty.txt")
    from app.core.exceptions import AppError
    import pytest

    with pytest.raises(AppError, match="empty"):
        _validate_upload(fake_txt, b"")


def test_csv_path_outside_upload_dir_is_refused():
    """
    Regression test: earlier versions extracted any '*.csv'-looking
    substring from the user's raw chat message and passed it straight
    to pd.read_csv(), which would have let a request like "read
    ../../etc/shadow.csv" attempt to read arbitrary server files.
    """
    import pytest

    with pytest.raises(ValueError, match="outside the managed uploads directory"):
        _resolve_trusted_csv_path("/etc/passwd.csv")


def test_dedupe_preserve_order_removes_duplicate_agents():
    agents = [AgentName.SALES, AgentName.SECURITY, AgentName.SALES, AgentName.ANALYTICS]
    deduped = _dedupe_preserve_order(agents)
    assert deduped == [AgentName.SALES, AgentName.SECURITY, AgentName.ANALYTICS]
