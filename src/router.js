import route from 'path-match';
import { reaction } from 'mobx';
import { createBrowserHistory } from 'history';

const createRouter = routes => {
  const matchers = Object.keys(routes).map(path => [route()(path), routes[path]]);
  return path => {
    return matchers.some(([matcher, f]) => {
      const result = matcher(path);
      if (result === false) return false;
      f(result);
      return true;
    })
  }
};

export const startRouter = routerStore => {
  const history = createBrowserHistory();
  const routes = createRouter(routerStore.routes);

  // call router.setView when url has been changed by back button
  history.listen((location, action) => {
    switch (action) {
      case 'POP':
        routes(location.pathname);
        break;
      default: break;
    }
  });

  // update browser url based on router.currentUrl
  reaction(
    () => routerStore.currentUrl,
    url => {
      if (history.location.pathname !== url) {
        history.push(url);
      }
    }
  );

  // route to current url
  routes(history.location.pathname);
};
