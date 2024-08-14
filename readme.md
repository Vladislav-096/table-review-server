<h1>Веб приложение отображающее постранично таблицу с данными без перезагрузки основной страницы.</h1>

- В качестве сборщика используется [vite](https://vitejs.dev/).
- Приложение написано с использованием фреймворка [React](https://react.dev/).
  <br>
  <br>
- Для написания таблицы и ее функционала используется библиотека [Ant Design](https://ant.design/).
- При переходе на новую вкладку результат кешируется.
- В таблице доступна пагинация.
- В каждом столбце таблицы доступны функции фильтрации и сортировки.
- На серверной стороне таблица загружается из файла в память.

### Запуск в контейнере

```
docker-compose up
```

### Запуск в режиме разработки (папка client)

```
npm run dev
```

### Запуск сервера (папка server)

```
node index.js
```
