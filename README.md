# Blog API

This is a blog API built with Express.js. It allows users to create posts and uses JWT for authentication and route protection.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)

## Installation
Install the dependencies: npm install

Start the server: npm start

Clone the repository:https://github.com/Felix-101/Blog-api.git


Navigate into the project directory:


## Usage

Once the server is running, you can interact with the API using a tool like Postman or curl. The API has the following endpoints:

- `POST /api/posts`: Create a new post.
- `GET /api/posts`: Get all posts.
- `GET /api/posts/:id`: Get a single post by ID.
- `PUT /api/posts/:id`: Update a post by ID.
- `DELETE /api/posts/:id`: Delete a post by ID.

Each endpoint requires authentication via JWT. Send your JWT in the `Authorization` header in the format `Bearer yourtokenhere`.

## Features

- Users can create posts.
- Users can view all posts.
- Users can view a single post.
- Users can update their posts.
- Users can delete their posts.
- JWT is used for authentication and route protection.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)






