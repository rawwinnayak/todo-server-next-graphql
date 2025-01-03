const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const { TodoList } = require("./todolist.jsx");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: `
            type Todo {
                id: ID!
                title: String!
                completed: Boolean!
            }
            type Query {
                getTodos: [Todo]
                getTodoById(id: ID!): Todo
            }
            type Mutation {
              addTodo(title:String!, completed: Boolean!): Todo
              removeTodo(id: ID!): Todo
              updateTodo(id: ID!, title: String, completed: Boolean): Todo
              }
        `,
    resolvers: {
      Query: {
        getTodos: async () => {
          try {
            return TodoList;
          } catch (err) {
            console.error("Error fetching todos:", err);
            throw new Error("Failed to fetch todos.");
          }
        },
        getTodoById: async (_, { id }) => {
          console.log("Fetching Todo with ID:", id);
          try {
            const todo = TodoList.find((todo) => todo.id === parseInt(id, 10)); // Ensure type-safe comparison
            if (!todo) {
              throw new Error(`Todo with ID ${id} not found`);
            }
            return todo;
          } catch (err) {
            console.error("Error fetching todo by ID:", err);
            throw new Error(err.message);
          }
        },
      },
      Mutation: {
        addTodo: async (_, { title, completed }) => {
          try {
            const newTodo = {
              id: TodoList.length ? TodoList[TodoList.length - 1].id + 1 : 1,
              title,
              completed,
            };
            TodoList.push(newTodo);
            return newTodo;
          } catch (err) {
            console.error("Error adding todo:", err);
            throw new Error("Failed to add todo.");
          }
        },
        removeTodo: async (_, { id }) => {
          try {
            const index = TodoList.findIndex(
              (todo) => todo.id === parseInt(id, 10)
            );
            if (index === -1) {
              throw new Error(`Todo with ID ${id} not found`);
            }
            const removeTodo = TodoList.splice(index, 1)[0];
            return removeTodo;
          } catch (err) {
            console.error("Error removing todo:", err);
            throw new Error(err.message);
          }
        },
        updateTodo: async (_, { id, title, completed }) => {
          try {
            const index = TodoList.findIndex(
              (todo) => todo.id === parseInt(id, 10)
            );
            if (index === -1) {
              throw new Error(`Todo with ID ${id} not found`);
            }
            if (title) {
              TodoList[index].title = title;
            }
            if (completed !== undefined) {
              TodoList[index].completed = completed;
            }
            return TodoList[index];
          } catch (err) {
            console.error("Error updating todo:", err);
            throw new Error(err.message);
          }
        },
      },
    },
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  app.use("/graphql", expressMiddleware(server));
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
}

startServer();
