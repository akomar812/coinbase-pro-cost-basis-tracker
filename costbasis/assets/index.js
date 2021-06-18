import React from 'react';
import ReactDOM from "react-dom";
import { useState, useEffect } from 'react'

function Loading() {
  return <div>Loading...</div>
}

function TransactionsTable(props) {
  return (
    <div>
      <div className="flex-row">
        <div className="flex-col">
          <div className="cell-md">Cost Basis</div>
          <div className="cell-md">{props.costBasis.toFixed(2)}</div>
        </div>
        <div className="flex-col">
          <div className="cell-md">Present Value</div>
          <div className="cell-md">{props.presentValue.toFixed(2)}</div>
        </div>
        <div className="flex-col">
          <div className="cell-md">Gain</div>
          <div className="cell-md">{100 * (((props.presentValue)/ props.costBasis) - 1).toFixed(4)%}</div>
        </div>
      </div>
      <div className="flex-row">
        <div>Search</div>
        <input type="text" onChange={props.handleSearch}/>
        <select onChange={props.handleSearchField}>
          <option value="asset">Asset</option>
          <option value="date">Date</option>
          <option value="side">Side</option>
          <option value="quantity">Quantity</option>
          <option value="price">Price</option>
        </select>
      </div>
      <div className="flex-row">
        <div className="interactive cell-sm" onClick={() => props.sort('asset')}>Asset</div>
        <div className="interactive cell-lg" onClick={() => props.sort('date')}>Date</div>
        <div className="interactive cell-sm" onClick={() => props.sort('side')}>Side</div>
        <div className="interactive cell-sm" onClick={() => props.sort('quantity')}>Quantity</div>
        <div className="interactive cell-sm" onClick={() => props.sort('price')}>Price</div>
      </div>
      {
        props.view.map((t, i) => {
          return (
            <div className="flex-row" key={i+'-'+t.asset+'-'+t.date}>
              <div className="cell-sm">{t.asset}</div>
              <div className="cell-lg">{t.date}</div>
              <div className="cell-sm">{t.side}</div>
              <div className="cell-sm">{t.quantity}</div>
              <div className="cell-sm">{t.price}</div>
            </div>
          )
        })
      }
    </div>
  )
}

function Transactions() {
  const [costBasis, setCostBasis] = useState(0);
  const [presentValue, setPresentValue] = useState(0);
  const [portfolio, setPortfolio] = useState({});
  const [prices, setPrices] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [transactionsView, setTransactionsView] = useState();
  const [searchField, setSearchField] = useState('asset');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  function computeCostBasis() {
    return transactionsView.reduce((s, t) => {
      const priceChange = t.price * t.quantity;
      const direction = t.side === 'buy' ? 1 : -1;
      return s + (priceChange*direction);
    }, 0);
  }

  function computePresentValue() {
    return Object.keys(portfolio).reduce((s, a) => s + (portfolio[a] * prices[a]), 0);
  }

  function loadPortfolio() {
    fetch('/costbasis/portfolio')
    .then((raw) => raw.json())
    .then((json) => {
      setTransactions(json);
      setTransactionsView(json);
    });
  }

  function loadPrices() {
    fetch('/costbasis/prices?assets=['+Object.keys(portfolio).map(a => '"'+a+'"').join(',')+']')
    .then((raw) => raw.json())
    .then((json) => setPrices(json));
  }

  function handleSearch(e) {
    if (e.target.value) {
      setTransactionsView(transactions.filter(t => t[searchField].toString().match(e.target.value.toUpperCase())));
    } else {
      //setSortField('data');
      //setSortDirection('asc');
      setTransactionsView(transactions);
    }
  }

  function handleSearchField(e) {
    setSearchField(e.target.value);
  }

  function sort(col) {
    if (sortField === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(col);
      setSortDirection('asc');
    }
  }

  useEffect(loadPortfolio, []);
  useEffect(loadPrices, [portfolio]);

  useEffect(() => {
    if (transactionsView) {
      const p = {};

      for (let i=0; i<transactionsView.length; i++) {
        const asset = transactionsView[i].asset;
        const quantity = transactionsView[i].quantity;
        const side = transactionsView[i].side === 'buy' ? 1 : -1;

        if (asset in p) {
          p[asset] += (side * quantity);
        } else {
          p[asset] = (side * quantity);
        }
      }

      setPortfolio(p);
    }
  }, [transactionsView]);

  useEffect(() => {
    if (transactionsView) {
      setCostBasis(computeCostBasis());
    }
  }, [transactionsView]);

  useEffect(() => {
    if (portfolio && prices) {
      setPresentValue(computePresentValue());
    }
  }, [portfolio, prices]);

  useEffect(() => {
    if (transactionsView) {
      setTransactionsView(transactionsView.sort((a, b) => {
        if (sortDirection === 'asc') {
          return a[sortField] > b[sortField];
        } else {
          return a[sortField] < b[sortField];
        }
      }));
    }
  }, [sortField, sortDirection, transactionsView]);

  return (
    <div>
      <div className="flex-col">
        <div>
          {
            transactionsView
              ? <TransactionsTable
                  costBasis={costBasis}
                  presentValue={presentValue}
                  view={transactionsView}
                  sort={sort}
                  handleSearch={handleSearch}
                  handleSearchField={handleSearchField}>
                </TransactionsTable>
              : <Loading></Loading>
          }
        </div>
      </div>
      <style>{`
        .interactive {
          cursor: pointer;
        }

        .flex-row {
          display: flex;
          flex-direction: row;
        }

        .flex-col {
          display: flex;
          flex-direction: column;
        }

        .cell-sm {
          min-width: 5rem;
        }

        .cell-md {
          min-width: 12rem;
        }

        .cell-lg {
          min-width: 18rem;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <div>
      <div>Coinbase Transactions</div>
      <Transactions></Transactions>
    </div>
  )
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);

