import { types, flow, getRoot, getSnapshot, applySnapshot } from 'mobx-state-tree';
import { keys } from 'mobx';
import View from './View';

const RouterStore = types
  .model('RouterStore', {
    views: types.map(View),
    currentView: types.maybe(types.reference(View)),
    params: types.frozen(),
    props: types.frozen(),
    isLoading: false
  })
  .views(self => ({
    get root() {
      return getRoot(self);
    },
    get currentUrl() {
      return self.currentView
        ? self.currentView.formatUrl(self.params)
        : '';
    },
    get routes() {
      let routes = {};
      let keyList = keys(self.views);
      keyList.forEach(k => {
        const view = self.views.get(k);
        routes[view.path] = params => self.setView(view, params);
      });
      return routes;
    }
  }))
  .actions(self => {
    let _history = null;
    let _runningSetView = null;
    let _queuedSetView = null;
    const _spinWait = resolve => setTimeout(resolve, 100);
    return {
      setHistory(history) {
        _history = history;
      },
      goBack() {
        _history.goBack();
      },
      goForward() {
        _history.goForward();
      },
      setLoading(isLoading) {
        self.isLoading = isLoading;
      },
      setView: flow(function* (view, params) {
        const thisSetView = {
          key: view.formatUrl(params),
          view: view,
          params: params
        };

        if (_runningSetView) {
          // if setView is already running or queued on this route, ignore
          if (_runningSetView.key === thisSetView.key || (_queuedSetView && _queuedSetView.key === thisSetView.key)) {
            return;
          }

          _queuedSetView = thisSetView;

          // spin this thread until it is no longer queued
          while (_queuedSetView) {
            yield new Promise(_spinWait);
          }
          
          // check that this is still the setView to process
          if (_runningSetView.key !== thisSetView.key) {
            return;
          }
        }

        _runningSetView = thisSetView;

        // save a snapshot to rollback to if something goes wrong
        const rootSnapshot = getSnapshot(self.root);
        
        const rollback = () => {
          applySnapshot(self.root, rootSnapshot);

          if (_queuedSetView) {
            _runningSetView = _queuedSetView;
            self.currentView = _runningSetView.view;
            self.params = _runningSetView.params;
            _queuedSetView = null;
          } else {
            self.isLoading = false;
          }
        };

        // before exit old view
        const oldView = self.currentView;
        const oldParams = self.params;
        
        if (oldView && oldView.beforeExit) {
          if ((yield oldView.beforeExit(oldParams)) === false) {
            return rollback();
          }
        }

        // check if route has been changed
        if (_queuedSetView) return rollback();
        
        // block out page for loading
        self.setLoading(true);

        // update current url
        self.currentView = view;
        self.params = params || {};

        // before enter new view
        if (view.beforeEnter) {
          if ((yield view.beforeEnter(params)) === false) {
            return rollback();
          }
        }

        // check if route has been changed
        if (_queuedSetView) return rollback();

        // on exit old view
        if (oldView && oldView.onExit) {
          yield self.currentView.onExit(oldParams);
        }

        // check if route has been changed
        if (_queuedSetView) return;

        // free up page to render
        self.props = self.props || {};
        self.setLoading(false);

        // on enter new view
        if (view.onEnter) {
          yield view.onEnter(params);
        }
        
        // check if route has been changed
        if (_queuedSetView) return;

        _runningSetView = null;
      }),
      setProps(props) {
        self.props = props;
      }
    }
  });

export default RouterStore;
