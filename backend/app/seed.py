"""Seed demo users and feed (run: `python -m app.seed` from backend/)."""

import asyncio
from datetime import date

from sqlalchemy import select

from app.config.settings import get_settings
from app.core.security import hash_password
from app.db.models import FeedProfile, User
from app.db.session import get_session_factory


SEED_USERS = [
    {
        "email": "demo@example.com",
        "password": "password123",
        "name": "Иван Демо",
        "birth": date(1995, 4, 15),
        "bio": "Люблю путешествия и новые впечатления. Работаю в IT.",
        "interests": ["Путешествия", "Фотография", "Музыка"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?w=1080",
        "in_feed": False,
        "personality": {"extroversion": 65, "openness": 80, "conscientiousness": 70, "agreeableness": 75, "emotionalStability": 68},
        "astrology": {"zodiacSign": "Овен", "element": "fire", "moonSign": "Рак", "ascendant": "Скорпион"},
        "numerology": {"lifePath": 4, "soulUrge": 5, "destiny": 9},
    },
    {
        "email": "anna@example.com",
        "password": "password123",
        "name": "Анна",
        "birth": date(1997, 6, 10),
        "bio": "Художница и любитель кофе.",
        "interests": ["Искусство", "Фотография", "Музыка"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1640677875583-7470bbf4749d?w=1080",
        "in_feed": True,
        "sort": 1,
        "personality": {"extroversion": 70, "openness": 85, "conscientiousness": 65, "agreeableness": 80, "emotionalStability": 70},
        "astrology": {"zodiacSign": "Близнецы", "element": "air", "moonSign": "Весы", "ascendant": "Водолей"},
        "numerology": {"lifePath": 3, "soulUrge": 6, "destiny": 9},
    },
    {
        "email": "max@example.com",
        "password": "password123",
        "name": "Максим",
        "birth": date(1993, 12, 20),
        "bio": "IT-предприниматель.",
        "interests": ["Технологии", "Путешествия", "Фитнес"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1665029542874-ca29bda24697?w=1080",
        "in_feed": True,
        "sort": 2,
        "personality": {"extroversion": 75, "openness": 78, "conscientiousness": 82, "agreeableness": 68, "emotionalStability": 72},
        "astrology": {"zodiacSign": "Козерог", "element": "earth", "moonSign": "Телец", "ascendant": "Дева"},
        "numerology": {"lifePath": 8, "soulUrge": 4, "destiny": 1},
    },
    {
        "email": "sofia@example.com",
        "password": "password123",
        "name": "София",
        "birth": date(1998, 8, 2),
        "bio": "Фотограф и путешественница.",
        "interests": ["Фотография", "Путешествия", "Природа"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1737678812331-4250eb3efd1b?w=1080",
        "in_feed": True,
        "sort": 3,
        "personality": {"extroversion": 60, "openness": 90, "conscientiousness": 68, "agreeableness": 82, "emotionalStability": 65},
        "astrology": {"zodiacSign": "Лев", "element": "fire", "moonSign": "Стрелец", "ascendant": "Овен"},
        "numerology": {"lifePath": 5, "soulUrge": 7, "destiny": 3},
    },
    {
        "email": "dmitry@example.com",
        "password": "password123",
        "name": "Дмитрий",
        "birth": date(1994, 3, 15),
        "bio": "Архитектор днём, музыкант вечером.",
        "interests": ["Музыка", "Архитектура", "Кино"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1632570866116-c999906df7bf?w=1080",
        "in_feed": True,
        "sort": 4,
        "personality": {"extroversion": 72, "openness": 88, "conscientiousness": 75, "agreeableness": 77, "emotionalStability": 71},
        "astrology": {"zodiacSign": "Рыбы", "element": "water", "moonSign": "Рак", "ascendant": "Скорпион"},
        "numerology": {"lifePath": 7, "soulUrge": 5, "destiny": 6},
    },
    {
        "email": "katya@example.com",
        "password": "password123",
        "name": "Екатерина",
        "birth": date(1996, 1, 22),
        "bio": "Психолог по образованию.",
        "interests": ["Книги", "Йога", "Кино"],
        "location": "Москва",
        "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1080",
        "in_feed": True,
        "sort": 5,
        "personality": {"extroversion": 55, "openness": 82, "conscientiousness": 88, "agreeableness": 90, "emotionalStability": 74},
        "astrology": {"zodiacSign": "Водолей", "element": "air", "moonSign": "Близнецы", "ascendant": "Весы"},
        "numerology": {"lifePath": 2, "soulUrge": 8, "destiny": 4},
    },
]


async def run() -> None:
    get_settings()
    factory = get_session_factory()
    async with factory() as session:
        exists = await session.execute(select(User).where(User.email == "demo@example.com"))
        if exists.scalar_one_or_none():
            print("Seed skipped (already present).")
            return
        for row in SEED_USERS:
            email = row["email"].lower()
            existing = await session.execute(select(User).where(User.email == email))
            if existing.scalar_one_or_none():
                continue
            u = User(
                email=email,
                password_hash=hash_password(row["password"]),
                display_name=row["name"],
                birth_date=row["birth"],
                bio=row["bio"],
                interests=list(row["interests"]),
                location=row["location"],
                avatar_url=row["photo"],
                personality=row["personality"],
                astrology=row["astrology"],
                numerology=row["numerology"],
            )
            session.add(u)
            await session.flush()
            if row.get("in_feed"):
                session.add(
                    FeedProfile(
                        user_id=u.id,
                        sort_order=int(row.get("sort", 0)),
                        is_active=True,
                    )
                )
        await session.commit()
    print("Seed completed.")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
