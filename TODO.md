# Migration from MySQL + SQLAlchemy to MongoDB Atlas + MongoEngine

## ✅ Phase 1: Clear MySQL Data
- [x] Create `backend/clear_data.py` script

## ✅ Phase 2: MongoDB Atlas Setup
- [x] 01. Update `backend/requirements.txt` - add MongoDB dependencies
- [x] 02. Update `backend/app/config.py` - MongoDB Atlas URI config
- [x] 03. Update `backend/app/extensions.py` - replace SQLAlchemy with MongoEngine
- [x] 04. Rewrite `backend/app/models/user.py` - User MongoEngine document
- [x] 05. Rewrite `backend/app/models/category.py` - Category MongoEngine document
- [x] 06. Rewrite `backend/app/models/book.py` - Book MongoEngine document
- [x] 07. Rewrite `backend/app/models/borrow_record.py` - BorrowRecord MongoEngine document
- [x] 08. Rewrite `backend/app/models/fine.py` - Fine MongoEngine document
- [x] 09. Rewrite `backend/app/models/notification.py` - Notification MongoEngine document
- [x] 10. Rewrite `backend/app/models/reservation.py` - Reservation MongoEngine document
- [x] 11. Rewrite `backend/app/models/review.py` - Review MongoEngine document
- [x] 12. Rewrite `backend/app/models/activity_log.py` - ActivityLog MongoEngine document
- [x] 13. Update `backend/app/models/__init__.py`
- [x] 14. Rewrite `backend/app/services/auth_service.py`
- [x] 15. Rewrite `backend/app/services/user_service.py`
- [x] 16. Rewrite `backend/app/services/book_service.py`
- [x] 17. Rewrite `backend/app/services/borrow_service.py`
- [x] 18. Rewrite `backend/app/services/category_service.py`
- [x] 19. Rewrite `backend/app/services/activity_service.py`
- [x] 20. Rewrite `backend/app/services/scheduler_service.py`
- [x] 21. Update `backend/app/__init__.py` - initialize MongoDB
- [x] 22. Create `backend/seed_mongo.py` - MongoDB seeding script
- [x] 23. Update ALL 10 route files with MongoDB queries
- [x] 24. Create `backend/.env` with MongoDB Atlas URI
- [ ] 25. Run `pip install -r requirements.txt` to install dependencies
- [ ] 26. Run `python seed_mongo.py` to seed initial data
- [ ] 27. Start the server with `python run.py` to verify functionality

