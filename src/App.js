import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';
import { Fragment, useState, useEffect, useReducer } from 'react';
const axios = require('axios').default;


const Pagination = ({ items, pageSize, onPageChange, onPageSizeChange }) => {
  
  console.log("Pagination", items, pageSize)

  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);

  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });

  return (
    <nav>
      {list.length == 0 ? null : (
        <div>
          <ul className="pagination">{list}</ul>
          Page Size : 
          <select onChange={onPageSizeChange} defaultValue="10">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
      </div>
      )}
      
    </nav>
  );

};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;

}

const useDataApi = (initialUrl, initialData) => {

  console.log("useDataApi", initialUrl, initialData);

  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    
    let didCancel = false;
    const fetchData = async () => {

      console.log("UseDataApi - Fetch Init"); 
      dispatch({ type: "FETCH_INIT" });
    
      try {
        const result = await axios(url);
        console.log("UseDataApi - Fetch Rest Api : ", result);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          console.log("UseDataApi - Fetch Failure");
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {

  console.log("DataFechReducer", state, action);

  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {

  console.log("Rendering App");

  const [query, setQuery] = useState('MIT');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]  = useState(10);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://api.publicapis.org/entries?title=car',
    {
      entries: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  const handlePageSizeChange = (e) => {
    
    setPageSize (Number(e.target.value));
    setCurrentPage (1);
  }

  console.log("App data :", data);

  let page = data.entries;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div>
          <Pagination
          items={data.entries}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange = {handlePageSizeChange}>
        </Pagination>

          <ul className="list-group">
            {page.map((item, index) => (
              <li className="list-group-item" key={index}>
                <a href={item.Link}>{item.API} - {item.Description}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
 
    </Fragment>
  );
}

export default App;
