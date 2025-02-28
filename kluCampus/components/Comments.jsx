// Yerel filtreleme kullan
const filterBooks = (searchText) => {
  return books.filter(book => 
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );
}; 