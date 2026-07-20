from app import create_app
from app.seed import run_seed


def main():
    app = create_app()
    with app.app_context():
        run_seed()
        print("Seed complete")


if __name__ == "__main__":
    main()
