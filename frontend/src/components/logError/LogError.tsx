import { Component, type ReactNode } from 'react';
import axios from 'axios';
import { getUrl } from '../../features/auth/authApi';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class LogError extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    axios
      .post(
        `${getUrl()}/api/errors/client`,
        {
          message: error.message,
          stackTrace: error.stack,
          pageUrl: window.location.pathname + window.location.search,
        },
        { withCredentials: true },
      )
      .catch(() => undefined);
  }

  render() {
    if (this.state.hasError) {
      return <p>Ошибка. Обновите страницу.</p>;
    }
    return this.props.children;
  }
}
