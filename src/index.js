import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import './index.css';
import logo from './logo.svg';
import './App.css';
import registerServiceWorker from './registerServiceWorker';

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      }
    default:
      return state;
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ]
    case 'TOGGLE_TODO':
      return state.map(state => todo(state, action));
    default:
      return state;
  }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
}

const todoApp = combineReducers({ todos, visibilityFilter });

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_ACTIVE':
      return todos.filter(todo => !todo.completed);
    case 'SHOW_COMPLETED':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

let nextTodoId = 0;

const Todo = ({ onClick, completed, text }) => (
  <div onClick={onClick} style={{ textDecoration: completed ? 'line-through' : 'none', cursor: 'pointer' }}>
    {text}
  </div>
);

const TodoList = ({ todos, onTodoClick }) => (
  <div>
    {todos.map(todo =>
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    )}
  </div>
);

const AddTodo = (props, { store }) => {
  let input;
  return (
    <div>
      <input ref={node => input = node} />
      <button onClick={() => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        })
        input.value = '';
      }}>
        Add Todo
          </button>
    </div>
  );
}
AddTodo.contextTypes = {
  store: PropTypes.object
}

const Button = ({ active, children, onClick }) => {
  return (
    <button
      style={{
        cursor: 'pointer',
        border: '0',
        backgroundColor: active ? '#101010' : 'inherit',
        color: active ? 'white' : '#101010'
      }}
      onClick={e => onClick()}>
      {children}
    </button>
  );
};

class FilterButton extends Component {

  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const { store } = this.context;
    const state = store.getState();

    return (
      <Button
        active={props.filter === state.visibilityFilter}
        onClick={() => store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter: props.filter
        })}>
        {props.children}
      </Button>
    );
  }
}
FilterButton.contextTypes = {
  store: PropTypes.object
}


const Footer = () => (
  <p style={{ position: 'fixed', bottom: '0', width: '100%' }}>
    <hr />
    <FilterButton filter='SHOW_ALL'> All </FilterButton>{' '}
    <FilterButton filter='SHOW_ACTIVE'> Active </FilterButton>{' '}
    <FilterButton filter='SHOW_COMPLETED'> Completed </FilterButton>
  </p>
);

class VisibleTodoList extends Component {

  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const { store } = this.context;
    const state = store.getState();

    return (
      <TodoList
        todos={
          getVisibleTodos(state.todos, state.visibilityFilter)
        }
        onTodoClick={
          id => store.dispatch({ type: 'TOGGLE_TODO', id })
        } />
    );
  }
}

VisibleTodoList.contextTypes = {
  store: PropTypes.object
}

const TodoApp = () => (
  <div className="App">

    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">Welcome to React</h1>
    </header>

    <div className="App-intro">
      <br />
      <AddTodo />
      <br /><br />
      <VisibleTodoList />
      <Footer />
    </div>

  </div>
);

ReactDOM.render((
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>

), document.getElementById('root'));

registerServiceWorker();