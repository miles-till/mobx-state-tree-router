import React from 'react';
import { observer } from "mobx-react";

const StateRouter = observer(({ router, loading }) => {
  if (router.isLoading) return loading ? loading : <span>loading</span>;

  return (
    <div>
      {router.currentView && router.currentView.component
        ? React.cloneElement(router.currentView.component, router.props)
        : 'currentView not loaded yet or component is missing'}
    </div>
  );
});

export default StateRouter;
