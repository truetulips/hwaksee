import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>⚠️ 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</h2>;
    }

    return this.props.children;
  }
}
