"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticProps = exports.getStaticPaths = void 0;
var react_1 = require("react");
var DbViewPageHead_1 = require("@components/db/DbViewPageHead");
var ErrorPage_1 = require("@components/db/ErrorPage");
var useDbQueryParams_1 = require("@components/hooks/useDbQueryParams");
var useDbView_1 = require("@components/hooks/useDbView");
var useSourceFile_1 = require("@components/hooks/useSourceFile");
var CenteredProgress_1 = require("@components/layout/CenteredProgress");
var PageContainer_1 = require("@components/layout/PageContainer");
var material_1 = require("@mui/material");
var react_query_1 = require("@tanstack/react-query");
var apiQueryUtils_1 = require("features/sourceTextBrowserDrawer/apiQueryUtils");
var sourceTextBrowserDrawer_1 = require("features/sourceTextBrowserDrawer/sourceTextBrowserDrawer");
var merge_1 = require("lodash/merge");
var dbApi_1 = require("utils/api/dbApi");
var nextJsHelpers_1 = require("utils/nextJsHelpers");
var nextJsHelpers_2 = require("utils/nextJsHelpers");
Object.defineProperty(exports, "getStaticPaths", { enumerable: true, get: function () { return nextJsHelpers_2.getDbViewFileStaticPaths; } });
function GraphPage() {
    var _a = (0, useDbQueryParams_1.useDbQueryParams)(), sourceLanguage = _a.sourceLanguage, fileName = _a.fileName, queryParams = _a.queryParams;
    var isFallback = (0, useSourceFile_1.useSourceFile)().isFallback;
    (0, useDbView_1.useDbView)();
    var _b = (0, react_query_1.useQuery)({
        queryKey: dbApi_1.DbApi.GraphView.makeQueryKey({ fileName: fileName, queryParams: queryParams }),
        queryFn: function () {
            return dbApi_1.DbApi.GraphView.call({
                fileName: fileName,
                queryParams: queryParams,
            });
        },
        refetchOnWindowFocus: false,
    }), data = _b.data, isLoading = _b.isLoading, isError = _b.isError;
    if (isError) {
        return <ErrorPage_1.ErrorPage backgroundName={sourceLanguage}/>;
    }
    if (isFallback) {
        return (<PageContainer_1.PageContainer backgroundName={sourceLanguage}>
        <CenteredProgress_1.CenteredProgress />
      </PageContainer_1.PageContainer>);
    }
    return (<PageContainer_1.PageContainer maxWidth="xl" backgroundName={sourceLanguage} hasSidebar={true}>
      <DbViewPageHead_1.DbViewPageHead />

      {isLoading ? (<CenteredProgress_1.CenteredProgress />) : (data === null || data === void 0 ? void 0 : data.piegraphdata.map(function (_a) {
            var name = _a[0], count = _a[1];
            return (<material_1.Typography key={name}>
            {name}: {count}
          </material_1.Typography>);
        }))}
      <sourceTextBrowserDrawer_1.SourceTextBrowserDrawer />
    </PageContainer_1.PageContainer>);
}
exports.default = GraphPage;
var getStaticProps = function (_a) {
    var locale = _a.locale, params = _a.params;
    return __awaiter(void 0, void 0, void 0, function () {
        var i18nProps, queryClient;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, nextJsHelpers_1.getI18NextStaticProps)({ locale: locale }, ["settings"])];
                case 1:
                    i18nProps = _b.sent();
                    return [4 /*yield*/, (0, apiQueryUtils_1.prefetchSourceTextBrowserData)(params === null || params === void 0 ? void 0 : params.language)];
                case 2:
                    queryClient = _b.sent();
                    return [2 /*return*/, (0, merge_1.default)({ props: { dehydratedState: (0, react_query_1.dehydrate)(queryClient) } }, i18nProps)];
            }
        });
    });
};
exports.getStaticProps = getStaticProps;
