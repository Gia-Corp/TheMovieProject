from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class WatchEvent:
    user_id: int
    id: Optional[int] = None
    watched_at: Optional[datetime] = None

    def __post_init__(self):
        self.watched_at = datetime.now()
