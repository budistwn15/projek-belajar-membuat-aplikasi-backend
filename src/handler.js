// import nanoid untuk membuat bookId unik
const {nanoid} = require('nanoid');
// import books
const books = require('./books');

// Kriteria 1 : Api dapat menyimpan buku

const addBookHandler = (request, h) => {
  // body request
  const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

  // client tidak melampirkan properti name pada request body
  if(!name || name === undefined){
    const response = h.response({
      "status": 'fail',
      "message": 'Gagal menambahkan buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }

  // client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount

  if(pageCount < readPage && readPage > pageCount){
    const response = h.response({
      "status": "fail",
      "message": "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
    });
    response.code(400);
    return response;
  }

  // properti yang ditebalkan diolah dan didapatkan di sisi server
  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBooks = {
    name,year,author,summary,publisher,pageCount,readPage,reading,id,finished,insertedAt,updatedAt
  };

  // Masukkan nilai ke dalam array books menggunakan method push()
  books.push(newBooks);

  // Mengecek apakah newBooks sudah masuk ke dalam array books
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // Server gagal memasukkan buku karena alasan umum (generic error)
  if(!isSuccess){
    const response = h.response({
      "status": "error",
      "message": "Buku gagal ditambahkan"
    });
    response.code(500);
    return response;
  }
  // Bila buku berhasil dimasukkan
  else{
    const response = h.response(
      {
      "status": "success",
      "message": "Buku berhasil ditambahkan",
      "data": {
          "bookId": id
      },
    });
    response.code(201);
    return response;
  }
}

// Kriteria 2: Api dapat menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
  const {name, reading, finished} = request.query;
  // Cek apakah ada query name
  if (name) {
    const queryName = books.filter((book) => {
      const nameRegex = new RegExp(name, 'gi');
      return nameRegex.test(book.name);
    });
    const response = h.response({
        status: 'success',
        data: {
          books: queryName.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
    response.code(200);
    return response;
  }

  // cek apakah ada query reading
  if (reading) {
    const queryReading = books.filter(
      (book) => Number(book.reading) === Number(reading),
    );
    const response = h.response({
        status: 'success',
        data: {
          books: queryReading.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
      response.code(200);
    return response;
  }

  // cek apakah ada query finished
  if(finished){
    const queryFinished = books.filter((book) => Number(book.finished) === Number(finished),
  );
  const response = h.response({
      status: 'success',
      data: {
        books: queryFinished.map((book) => ({
          id: book.id,
            name: book.name,
            publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

    // server harus mengembalikan respon dengan status code : 200
    if (books) {
    // bila query tidak ada
      const response = h.response({
      "status": "success",
      "data": {
        books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      }
      });
      response.code(200);
      return response;
    }
    // jika belum terdapat buku yang dimasukkan, server bisa merespons dengan array books kosong
    else{
      const response = h.response({
      "status": "success",
      "data": [],
      });
      response.code(200);
      return response;
    }

    
}

// Kriteria 3 : API dapat menampilkan detail buku
const getBookByIdHandler = (request,h) => {
  const {bookId} = request.params;

  const book = books.filter((b) => b.id === bookId)[0];
  // Bila buku dengan id tidak ditemukan
  if (!book) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  // Bila buku dengan id yang dilampirkan ditemukan
  else{
    const response = h.response({
        status: 'success',
        data: {
          book
        },
      });
      response.code(200);
      return response;
  }
};

// Kriteria 4 : Api dapat mengubah buku

const editBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  // body request
  const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

  // client tidak melampirkan properti name pada request body
  if(!name || name === undefined){
    const response = h.response({
      "status": 'fail',
      "message": 'Gagal memperbarui buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }

  // client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount

  if(pageCount < readPage && readPage > pageCount){
    const response = h.response({
      "status": "fail",
      "message": "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
    });
    response.code(400);
    return response;
  }

  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  // dapatkan index array pada objek sesuai bookId
  const index = books.findIndex((b) => b.id === bookId);
  // id yang dilampirkan oleh client tidak ditemukan oleh server
  if (index === -1) {
    const response = h.response({
      "status": "fail",
      "message": "Gagal memperbarui buku. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }
  // Bila buku berhasil diperbarui
  else{
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };
    const response = h.response({
      "status": "success",
      "message": "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

};

// Kriteria 5 : API dapat menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  // dapatkan index dari objek catatan sesuai dengan id
  const index = books.findIndex((b) => b.id === bookId);
  // id yang dilampirkan oleh client tidak ditemukan oleh server
  if (index === -1) {
    const response = h.response({
      "status": "fail",
      "message": "Buku gagal dihapus. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }
  // Bila buku berhasil dihapus
  else{
    books.splice(index,1)
    const response = h.response({
      "status": "success",
      "message": "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }
};

module.exports = {addBookHandler, getAllBooksHandler, getBookByIdHandler,editBookByIdHandler,deleteBookByIdHandler};

