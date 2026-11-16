class ServiceError(Exception):
    """Expected, user-facing error. Converted to a JSON response in main.py."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
