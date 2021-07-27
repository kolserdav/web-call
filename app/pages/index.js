'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var Home_module_css_1 = __importDefault(require('../styles/Home.module.css'));
function Home() {
  return <div className={Home_module_css_1.default.container}></div>;
}
exports.default = Home;
