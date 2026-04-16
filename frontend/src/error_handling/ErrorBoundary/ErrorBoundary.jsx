import { Component } from "react";
import "./ErrorBoundary.css";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo salió mal 😵‍💫</h2>
          <p className="error-message">({this.state.error.message})</p>
        </div>
      );
    }
    return this.props.children;
  }
}
