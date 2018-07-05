import ActionsFeature from '../features/actions';
import ActionsInterface from './actionsInterface';
export default class Inspector implements ActionsInterface {
    private MODULE_NAME;
    private actionFeature;
    constructor(actionFeature: ActionsFeature);
    init(): Promise<{}>;
    private exposeActions(inspectorPath);
}
