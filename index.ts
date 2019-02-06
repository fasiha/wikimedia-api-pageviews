// https://wikimedia.org/api/rest_v1/#!/Pageviews_data/get_metrics_pageviews_aggregate_project_access_agent_granularity_start_end

import fetch from 'node-fetch';

const URL = "https://wikimedia.org/api/rest_v1";
const route = `/metrics/pageviews/aggregate/{project}/{access}/{agent}/{granularity}/{start}/{end}`;

type PageviewsParams = {
  project: string,
  granularity: 'hourly'|'daily'|'monthly',
  agent: 'all-agents'|'user'|'spider',
  access: 'all-access'|'desktop'|'mobile-web'|'mobile-app',
  start: string,
  end: string
};

function parseMustache(template: string) {
  const mustasches = template.match(/{[^}]+}/g) || [];
  const variables = new Set(mustasches.map(s => s.slice(1, -1)));
  return {
    replacer: (mapping: {[key: string]: string}) => {
      let filledTemplate = template;
      for (let [key, val] of Object.entries(mapping)) { filledTemplate = filledTemplate.replace(`{${key}}`, val); }
      return filledTemplate;
    },
    validator: (filledTemplate: string) => !filledTemplate.includes('{'),
    variables,
  };
}

function invalidYYYYMMDDHH(s: string): string {
  if (s.length !== 10) { return '10 numeric characters needed for YYYYMMDDHH'; }
  let y = parseInt(s.slice(0, 4));
  let m = parseInt(s.slice(4, 6));
  let d = parseInt(s.slice(6, 8));
  let h = parseInt(s.slice(8, 10));
  if (![y, m, d, h].every(isFinite)) { return 'one or more characters were not numbers'; }
  if (!(m >= 1 && m <= 12)) { return 'bad month'; }
  if (!(d >= 1 && d <= 31)) { return 'bad day'; }
  if (!(h >= 0 && h <= 23)) { return 'bad hour'; }
  return '';
}

function getFullURL(params: PageviewsParams) {
  if (invalidYYYYMMDDHH(params.start) || invalidYYYYMMDDHH(params.end)) { throw new Error('invalid dates'); }

  const {replacer, validator, variables} = parseMustache(route);
  if (!Object.keys(params).every(v => variables.has(v))) { throw new Error('one or more params missing in template'); }

  const finalURL = URL + replacer(params);
  if (!validator(finalURL)) { throw new Error('invalid filled-in mustache. ' + finalURL); }

  return finalURL;
}

export async function get(params: PageviewsParams) {
  return fetch(getFullURL(params)).then(x => x.json()).catch(e => {
    console.error('ERROR encountered: ' + e);
    throw e;
  });
}

if (module === require.main) {
  (async () => {
    const data = await get({
      project: 'en.wikipedia.org',
      granularity: 'hourly',
      agent: 'user',
      access: 'all-access',
      start: '2019010100',
      end: '2019010101'
    });
    console.log(data);
  })();
}