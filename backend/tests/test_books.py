from tests.helpers import auth_header


def test_list_books_requires_auth(client):
    res = client.get("/api/books")
    assert res.status_code == 401


def test_student_cannot_add_book(client, student_token):
    token, _ = student_token
    res = client.post(
        "/api/books", json={"title": "X", "author": "Y", "quantity": 1}, headers=auth_header(token)
    )
    assert res.status_code == 403


def test_librarian_can_add_book(client, librarian_token):
    token, _ = librarian_token
    res = client.post(
        "/api/books",
        json={"title": "New Book", "author": "Author", "quantity": 3},
        headers=auth_header(token),
    )
    assert res.status_code == 201
    assert res.get_json()["available_copies"] == 3


def test_duplicate_isbn_rejected(client, librarian_token):
    token, _ = librarian_token
    payload = {"title": "Book A", "author": "Author", "quantity": 1, "isbn": "999"}
    client.post("/api/books", json=payload, headers=auth_header(token))
    res = client.post("/api/books", json=payload, headers=auth_header(token))
    assert res.status_code == 409


def test_update_book_quantity_adjusts_available_copies(client, librarian_token):
    token, _ = librarian_token
    res = client.post(
        "/api/books", json={"title": "B", "author": "A", "quantity": 2}, headers=auth_header(token)
    )
    book_id = res.get_json()["id"]

    res2 = client.put(f"/api/books/{book_id}", json={"quantity": 5}, headers=auth_header(token))
    assert res2.status_code == 200
    assert res2.get_json()["available_copies"] == 5  # 2 available + delta of 3


def test_delete_book(client, librarian_token):
    token, _ = librarian_token
    res = client.post(
        "/api/books", json={"title": "C", "author": "A", "quantity": 1}, headers=auth_header(token)
    )
    book_id = res.get_json()["id"]

    res2 = client.delete(f"/api/books/{book_id}", headers=auth_header(token))
    assert res2.status_code == 200

    res3 = client.get(f"/api/books/{book_id}", headers=auth_header(token))
    assert res3.status_code == 404
