from dataclasses import dataclass
from datetime import datetime


@dataclass
class WatchEvent:
    id: int
    user_id: int
    watched_at: datetime
