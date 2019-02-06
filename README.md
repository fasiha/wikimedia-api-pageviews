# wikimedia-api-pageviews
Very barebones way to hit the Wikimedia REST API to get pageviews data in a Node.js project.

See [Wikimedia's documentation](https://wikimedia.org/api/rest_v1/#!/Pageviews_data/get_metrics_pageviews_aggregate_project_access_agent_granularity_start_end).

Installation and usage guide, assumes knowledge of Node.js:
```
$ npm install --save https://github.com/fasiha/wikimedia-api-pageviews.git
$ node
> var {get} = require('wikimedia-api-pageviews');
> var opts = {project: 'en.wikipedia.org', granularity: 'hourly', agent: 'user', access: 'all-access', start: '2019010100', end: '2019010101'};
> get(opts).then(res => console.log(res));
```
This will print the following:
```
 { items:
   [ { project: 'en.wikipedia',
       access: 'all-access',
       agent: 'user',
       granularity: 'hourly',
       timestamp: '2019010100',
       views: 10485148 },
     { project: 'en.wikipedia',
       access: 'all-access',
       agent: 'user',
       granularity: 'hourly',
       timestamp: '2019010101',
       views: 10274981 } ] }
```