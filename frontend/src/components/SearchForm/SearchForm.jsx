import "./SearchForm.css";

function SearchForm() {
  return (
    <form className="search-form">
      <button className="search-button" type="button">
        Buscar
      </button>
      <input placeholder="Una peli..." type="text" />
    </form>
  );
}

export default SearchForm;
