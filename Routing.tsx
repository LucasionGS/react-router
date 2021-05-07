import React, { useState } from "react";

/**
 * Routing v4
 */
function Router(props: {
  /**
   * Possible routes and their relative conditions.
   */
  routes: PageRoute[],
  /**
   * Override the current path by defining this with a path.
   */
  overridePath?: string,
  /**
   * 404 page if no page is found.
   */
  NotFoundPage?: JSX.Element
}) {
  const [pageData, setPageData] = useState<JSX.Element>(undefined); // Imagine using undefined as a literal value smh
  if (pageData !== undefined) {
    return pageData;
  }

  let {
    routes,
    overridePath
  } = props;

  // Correct routes.
  if (routes.length > 1) routes = routes.map(r => { r.priority = r.priority ?? 0; return r; }).sort((r, r2) => r2.priority - r.priority);

  // Parse routes
  let path = overridePath ?? window.location.pathname;
  let route = routes.find(r => {
    if (typeof r.name === "string") {
      return r.name === path;
    }
    else if (r.name instanceof RegExp) {
      return r.name.test(path);
    }
    return false;
  });

  if (!route) {
    return props.NotFoundPage ?? (<div>
      <h1>404</h1>
      <p>The page could not be found.</p>
    </div>);
  }

  if (route.redirect) {
    window.location.href = route.redirect;
    return (<></>);
  }

  try {
    if (typeof route.page === "function") {
      if (typeof route.name === "string") {
        let loadedPage = ((route as PageRouteStatic).page as (() => Promise<JSX.Element>))();
        Promise.resolve().then(async () => {
          setPageData(await loadedPage);
        });
        return (<>Please wait while the page loads...</>) // Should be user defined loading page?
      }
      else if (route.name instanceof RegExp) {
        let matches = path.match(route.name);
        let m = matches.shift();
        let loadedPage = ((route as PageRouteDynamic).page as ((match: string, ...rest: string[]) => Promise<JSX.Element>))(m, ...matches);
        Promise.resolve().then(async () => {
          setPageData(await loadedPage);
        });
        return (<>Please wait while the page loads...</>) // Should be user defined loading page?
      }
      else {
        return (
          <div>
            <p>Internal Error</p>
            <p>Unknown Error</p>
          </div>
        );
        return (<div>Internal Error</div>);
      }
    }
    else {
      if (!route.page) return (
        <div>
          <p>Internal Error</p>
          <p>Missing page</p>
        </div>
      );
      return route.page;
    }
  } catch (error) {
    return props.NotFoundPage ?? (<div>
      <h1>404</h1>
      <p>The page cound not be found.</p>
    </div>)
  }
}

export interface PageRouteDynamic {
  name: RegExp;
  page?: JSX.Element | ((match: string, ...rest: string[]) => Promise<JSX.Element> | JSX.Element);
  redirect?: string;
  priority?: number;
}

export interface PageRouteStatic {
  name: string;
  page?: JSX.Element | (() => Promise<JSX.Element> | JSX.Element);
  redirect?: string;
  priority?: number;
}

export type PageRoute = PageRouteDynamic | PageRouteStatic;

export default Router;
