import React from 'react';
import { observer } from 'mobx-react';

const Link = observer(({ router, view, params, children, className }) => {
  const clickLink = e => {
    e.preventDefault();
    router.setView(view, params);
  };

  return (
    <a href={view.formatUrl(params)} onClick={clickLink} className={className}>
      <div>{children}</div>
    </a>
  );
});

export default Link;
