# Logwise

## 📜 Introduction
**Logwise** is a logging system based on Winston, designed to provide and record detailed and organized logs for Node.js applications. 
It includes support for global logging and specific functions for different types of events, without the need to export it in every file where it is used!

## 📦 Installation

```sh
npm install logwise
```

## 🚀 Usage

```ts
import { log } from "logwise";

logwise.api("Request made to API.");
logwise.db("Database connection request initiated.");
logwise.error("Failed to process request.", error);
logwise.error(error);
logwise.verbose([{ user: "admin", action: "login" }, some_method()]);
```

## 🔥 Features

### 📌 API Log
```ts
logwise.api("Message");
```
_Description:_ Used to record events related to the API.

### 🛢️ Database Log
```ts
logwise.db("Database query");
```
_Description:_ Records events and transactions occurring in the database.

### ⚠️ Error Log
```ts
logwise.error("Message to identify the error: ", errorObj); // With or without description!
logwise.error(error);
```
_Description:_ Records error messages, accepting any type of data.

### 🛠️ Verbose Log
```ts
logwise.verbose(objectOrFunction);
```
_Description:_ Used for advanced debugging, identifying variable types, methods, and listing all properties of the given object.
**WARNING:** As the name suggests, this method is extremely verbose and can produce extensive output. I recommend using `logwise.debug` in most cases!

### ✅ Success Log
```ts
logwise.success("Operation completed successfully!");
```
_Description:_ Used to register successful calls.

### 🛠️ Debug Log
```ts
logwise.debug(variable);
```
_Description:_ Used for debugging without excessive verbosity. Unlike `log.verbose`, this method provides enough information to analyze variables without generating an extensive log.

## ❗ Best Practices and Additional Information
- The `logwise.verbose` and `logwise.debug` methods are disabled in production environments for security reasons. Their logs are also never saved or persisted!
- Do not expose sensitive logs in production.
- When debugging passwords, tokens, and other sensitive information, always use the debugger instead of storing this data in log files.
- Ensure error logs are recorded correctly for future analysis.
- Use `logwise.success` to register successful operations!
- Give a star to this repository so your bugs get fixed. ✨

## 📜 License
**Logwise** is licensed under MIT.

## 🔗 Contact
Developed by **Manolo Dias**.
Any suggestions? Do you think something is missing? Get in touch! For questions or suggestions:
- WhatsApp:  [+55 (21) 96889-9448](https://wa.me/5521968899448)
- GitHub:   [Manolo Dias](https://github.com/manolo-dias/fancy-logger)
- Email:    [manolo@blenddev.com.br](mailto:manolo@blenddev.com.br)
- Team:     [GRUPO BLEND](https://grupoblend.com.br)
