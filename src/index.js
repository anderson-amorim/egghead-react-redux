import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { combineReducers, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import './index.css';
import logo from './logo.svg';
import './App.css';
import registerServiceWorker from './registerServiceWorker';

let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

const setVisiilityFilter = (filter) => {
  return {
      type: 'SET_VISIBILITY_FILTER',
      filter
    } 
}

const toggleTodo = (id) => {
  return {
      type: 'TOGGLE_TODO',
      id
    } 
}

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

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => input = node} />
      <button onClick={() => {
        dispatch(addTodo(input.value))
        input.value = '';
      }}>
        Add Todo
          </button>
    </div>
  );
}

AddTodo = connect()(AddTodo);

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

const mapStateToButtonProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
};

const mapDispathToButtonProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  }
};

const FilterButton = connect(mapStateToButtonProps, mapDispathToButtonProps)(Button);

const Footer = () => (
  <p style={{ position: 'fixed', bottom: '0', width: '100%' }}>
    <hr />
    <FilterButton filter='SHOW_ALL'> All </FilterButton>{' '}
    <FilterButton filter='SHOW_ACTIVE'> Active </FilterButton>{' '}
    <FilterButton filter='SHOW_COMPLETED'> Completed </FilterButton>
  </p>
);

const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
};

const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: id => dispatch(toggleTodo(id))
  }
};

const VisibleTodoList = connect(mapStateToTodoListProps, mapDispatchToTodoListProps)(TodoList);

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

const todoApp = combineReducers({ todos, visibilityFilter });

ReactDOM.render((
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>

), document.getElementById('root'));

registerServiceWorker();
