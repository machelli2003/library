# Implementation Plan Checklist

## Backend Changes
- [x] A1: Grant admin access to librarian routes (already done - routes already include admin)
- [x] A2: Add user edit endpoint (PUT /users/<id>) + DELETE /users/<id> + GET /users/<id>
- [x] A3: Add book borrow history endpoint (GET /books/<id>/history)
- [x] A4: Add dashboard endpoint for recent registrations
- [x] A5: Add dashboard endpoint for book stats (most/least borrowed, overdue by category)
- [x] A6: Add bulk book import endpoint (POST /books/bulk-import)

## Frontend Changes
- [ ] B1: Admin navigation sidebar — add librarian module links
- [ ] B2: Enhanced Admin Dashboard with more stats
- [ ] B3: Enhanced Librarian Dashboard with trends/popular
- [ ] B4: Category edit functionality
- [ ] B5: User detail editing modal
- [ ] B6: Book borrowing history page (BookHistory.jsx)
- [ ] B7: Borrow history filters
- [ ] B8: Bulk import page (BulkImport.jsx)
- [ ] B9: Overdue tracking enhancement (sort overdue first)
- [ ] B10: API service updates for new endpoints
- [ ] B11: App.jsx routing updates

