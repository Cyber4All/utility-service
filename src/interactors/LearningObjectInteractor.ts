import { DataStore, Responder } from './../interfaces/interfaces';
import { LearningObjectRepoFileInteractor } from './LearningObjectRepoFileInteractor';

export async function create(dataStore: DataStore, responder: Responder, learningObject, user: any) {
      // create new LearningObject(userid, data_as_json)
      dataStore.createLearningObject(user.userid, learningObject)
        .then((learningObjectID) => {
          responder.sendLearningObject(learningObjectID);
        })
        .catch((error: string) => {
          if (error.match(/duplicate\s+key/g).length > 0) {
            responder.sendOperationError(`Please enter a unique name for this Learning Object.`, 400);
          } else
            responder.sendOperationError(`There was an error creating new Learning Object. ${error}`, 400);
        });
}

export async function update(dataStore: DataStore, responder: Responder, learningObjectID, learningObject, user) {

  // Patch data_as_json via dataStore call (else send error ->)
  dataStore.updateLearningObject(user.userid, learningObjectID, learningObject)
    .then(() => {
      responder.sendOperationSuccess();
    })
    .catch((error) => {
      if (error.match(/duplicate\s+key/g).length > 0) {
        responder.sendOperationError(`Please enter a unique name for this Learning Object.`, 400);
      } else
        responder.sendOperationError(`There was an error creating new learning object. ${error}`, 400);
    });
}

export async function destroy(dataStore: DataStore, responder: Responder, learningObjectID, user) {
      // Delete LO from data store (else send error ->)
      dataStore.deleteLearningObject(learningObjectID)
        .then(() => {
          let learningObjectFile = new LearningObjectRepoFileInteractor();
          learningObjectFile.deleteAllFiles(this.dataStore, responder, learningObjectID, user);
        })
        .catch((error) => {
          responder.sendOperationError(`There was an error deleting learning object. ${error}`, 400);
        });
      // Send verification ->
}

/**
 * Fetch all Learning Objects associated with the given user.
 *
 * @export
 * @param {AccessValidator} accessValidator
 * @param {DataStore} dataStore
 * @param {Responder} responder
 * @param {any} user
 */
export async function read(dataStore: DataStore, responder: Responder, user) {
      dataStore.getMyLearningObjects(user.userid)
        .then((learningObjects) => {
          responder.sendLearningObjects(learningObjects);
        })
        .catch((error) => {
          responder.sendOperationError(`There was an error fetching user's learning objects. ${error}`, 400);
        });
}

export async function readOne(dataStore: DataStore, responder: Responder, learningObjectID, user) {
  // TODO: Once publish flag is in the database, add check (if you combine cube and onion readOne functionality)
  dataStore.getLearningObject(learningObjectID)
    .then((learningObject) => {
      // If published
      responder.sendLearningObject(learningObject);
      // else, ensure user has ownership
    })
    .catch((error) => {
      responder.sendOperationError(`There was an error fetching user's learning object. ${error}`, 400);
    });
}

// Cube Functions
export async function fetchLearningObjects(dataStore: DataStore, responder: Responder, filters?: object) {
  // TODO: Allow optional filters in DataStore.readLearningObjects()
  console.log(filters);
  // parse filters
  if (filters['academiclevel']) {
    // do something with academiclevel filter here
  }
  if (filters['page']) {
    // do something with page filtering here (IE change page)
  }
  let learningObjects = await dataStore.readLearningObjects();
  responder.sendLearningObjects(learningObjects);
}
export async function fetchLearningObject(dataStore: DataStore, responder: Responder, author: string, learningObjectName: string) {
  let learningObject = await dataStore.readLearningObject(author, learningObjectName);
  responder.sendLearningObjects(learningObject);
}
export async function fetchMultipleLearningObject(dataStore: DataStore, responder: Responder, ids: string[]) {
  let learningObjects = await dataStore.readMultipleLearningObjects(ids, false);
  responder.sendLearningObjects(learningObjects);
}
// END CUBE FUNCTIONS
