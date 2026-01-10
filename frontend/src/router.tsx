import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResourceSearchPage from './pages/ResourceSearchPage';
import ResourceDetailPage from './pages/ResourceDetailPage';

export const AppRouter: React.FC = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/risorse" component={ResourceSearchPage} />
      <Route path="/risorse/:id" component={ResourceDetailPage} />
    </Switch>
  </Router>
);

export default AppRouter;
