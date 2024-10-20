import { KeyInterface } from './types/key.interface';
import { DataService } from './data.service';
import { RequestService } from './request.service';

export class ReconciliationService {
  private dataService: DataService;
  private requestService: RequestService; // include: download/upload/reconciliation
  private compareService: any; // include: compare data
  private key: KeyInterface;
  private parterKey: KeyInterface;

  constructor() {}

  requestReconcile() {
    // already build own data
    // already upload data to monetaService
    // set reconciliation request to monetaService
  }

  reconcile() {
    // get data from monetaService
    // using partner public key to decrypt data
    // compare data
    // equal
    // sign contracts with accept information
    // ***
    // not equal resolve conflict
    // upload data to monetaService
    // sign contracts with reject information
  }
  execute() {
    // get data from monetaService
    // using partner public key to decrypt data
    // get own data
  }
}
// request reconciliation # resolve reconciliation
