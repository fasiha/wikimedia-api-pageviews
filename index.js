"use strict";
// https://wikimedia.org/api/rest_v1/#!/Pageviews_data/get_metrics_pageviews_aggregate_project_access_agent_granularity_start_end
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const URL = "https://wikimedia.org/api/rest_v1";
const route = `/metrics/pageviews/aggregate/{project}/{access}/{agent}/{granularity}/{start}/{end}`;
function parseMustache(template) {
    const mustasches = template.match(/{[^}]+}/g) || [];
    const variables = new Set(mustasches.map(s => s.slice(1, -1)));
    return {
        replacer: (mapping) => {
            let filledTemplate = template;
            for (let [key, val] of Object.entries(mapping)) {
                filledTemplate = filledTemplate.replace(`{${key}}`, val);
            }
            return filledTemplate;
        },
        validator: (filledTemplate) => !filledTemplate.includes('{'),
        variables,
    };
}
function invalidYYYYMMDDHH(s) {
    if (s.length !== 10) {
        return '10 numeric characters needed for YYYYMMDDHH';
    }
    let y = parseInt(s.slice(0, 4));
    let m = parseInt(s.slice(4, 6));
    let d = parseInt(s.slice(6, 8));
    let h = parseInt(s.slice(8, 10));
    if (![y, m, d, h].every(isFinite)) {
        return 'one or more characters were not numbers';
    }
    if (!(m >= 1 && m <= 12)) {
        return 'bad month';
    }
    if (!(d >= 1 && d <= 31)) {
        return 'bad day';
    }
    if (!(h >= 0 && h <= 23)) {
        return 'bad hour';
    }
    return '';
}
function getFullURL(params) {
    if (invalidYYYYMMDDHH(params.start) || invalidYYYYMMDDHH(params.end)) {
        throw new Error('invalid dates');
    }
    const { replacer, validator, variables } = parseMustache(route);
    if (!Object.keys(params).every(v => variables.has(v))) {
        throw new Error('one or more params missing in template');
    }
    const finalURL = URL + replacer(params);
    if (!validator(finalURL)) {
        throw new Error('invalid filled-in mustache. ' + finalURL);
    }
    return finalURL;
}
function index(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return node_fetch_1.default(getFullURL(params)).then(x => x.json()).catch(e => {
            console.error('ERROR encountered: ' + e);
            throw e;
        });
    });
}
exports.index = index;
if (module === require.main) {
    (() => __awaiter(this, void 0, void 0, function* () {
        const data = yield index({
            project: 'en.wikipedia.org',
            granularity: 'hourly',
            agent: 'user',
            access: 'all-access',
            start: '2019010100',
            end: '2019010101'
        });
        console.log(data);
    }))();
}
