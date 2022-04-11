# RESTful API 
This is a RESTful API that represents the backend of an E-reading tracking application. The routes are listed below

## Users
- POST     /users/register
- POST     /users/login
- GET      /users/currentUser
- GET      /users/:userId
- GET      /users/:userId/books
- DELETE   /users/settings/delete
- POST     /users/goals

## Books
- GET      /books
- POST     /books
- GET      /books/{book_id}
- DELETE   /books/{book_id}
- POST     /books/{book_id}/opened
- POST     /books/{book_id}/closed
- POST     /books/{book_id}/finished
- PUT      /books/{book_id}/edit
- POST     /books/{book_id}/edit/upload

## Highlights
- GET      /highlights/{book_id}
- POST     /highlights/{book_id}
- GET      /highlights/{book_id}/{highlight_id}
- DELETE   /highlights/{book_id}/{highlight_id}
- PUT      /highlights/{book_id}/{highlight_id}

## Reads
- GET      /reads/{book_id}
- POST     /reads/{book_id}
- GET      /reads/{book_id}/{read_id}
- DELETE   /reads/{book_id}/{read_id}
- PUT      /reads/{book_id}/{read_id}
- POST     /reads/{book_id}/{read_id}/finished

## Sessions
- GET      /sessions/{read_id}
- POST     /sessions/{read_id}
- DELETE   /sessions/{read_id}/{session_id}
- PUT      /sessions/{read_id}/{session_id}

## Metrics
- GET      /metrics/numbers
- GET      /metrics/numbers/:userId
- GET      /metrics/percentage
- GET      /metrics/goals
- GET      /metrics/goals/:userId
- GET      /metrics/weekly
- GET      /metrics/monthly
- GET      /metrics/yearly
- GET      /metrics/total
- GET      /metrics/calendar
- GET      /metrics/tags/read
- GET      /metrics/tags/books

## Search
- GET      /search

## Settings
- PUT      /users/profile/edit
- POST     /users/profile/edit/upload
- GET      /users/settings
- PUT      /users/settings/appearance
- PUT      /users/settings/privacy
- GET      /users/settings/profile/:userId

## Friends
- GET      /friends
- DELETE   /friends/:friendId
- GET      /friends/requests
- POST     /friends/requests
- DELETE   /friends/requests/:friendId
- POST     /friends/requests/:friendId
- GET      /friends/mutual/:userId

## Notifications
- GET      /notifications

## Badges
- GET      /badges