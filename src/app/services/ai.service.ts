import { Injectable } from '@angular/core';
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { FaceClient } from "@azure/cognitiveservices-face";

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private APIKEY = '0b078d7c72e34dd9a6e246a125284987';
  private ENDPOINT = 'https://camapp-aline.cognitiveservices.azure.com/';

  constructor() { }

  async descreverImagem(foto: Blob) { // transformar em url para nuvem, método assicrono
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY); // Para fazer login
    const client = new ComputerVisionClient(cognitiveServiceCredentials, this.ENDPOINT); // Para onde vai mandar a chave

    return await client.describeImageInStream(foto, { language: 'pt' }).then(retorno => { 
      console.log('Descrever Imagem: ', retorno);

      return {
        descricao: retorno.captions ? retorno.captions[0].text : "", // texto da imagem
        confianca: retorno.captions ? retorno.captions[0].confidence : "", // confiança
        tags: retorno.tags ? retorno.tags : [], // o que AI viu
        tipo: 'descrever'
      }
    });
  }

  async tagsImagem(foto: Blob) { // Tags é mais confiável na imagem
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY);
    const client = new ComputerVisionClient(cognitiveServiceCredentials, this.ENDPOINT);

    return await client.tagImageInStream(foto, { language: 'pt' }).then(retorno => { // arquivo e não url
      console.log('Tags Imagem: ', retorno);

      return {
        tags: retorno.tags, // só pega as tags
        tipo: 'tags'
      }
    });
  }

  async deteccaoFacial(foto: Blob) {
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY);
    const client = new FaceClient(cognitiveServiceCredentials, this.ENDPOINT);

    return await client.face.detectWithStream(foto,
      {
        detectionModel: 'detection_01',
        recognitionModel: 'recognition_04',
        returnFaceAttributes: ['age', 'gender', 'headPose', 'smile', 'facialHair', 'glasses', 'emotion', 'hair',
          'makeup', 'occlusion', 'accessories', 'blur', 'exposure', 'qualityForRecognition']
      }
    ).then(retorno => {
      console.log('Detecção de Face: ', retorno);

      return retorno.map(face => ({ // foto pode ter mais de uma face
        atributos: face.faceAttributes,
        posicao: face.faceRectangle,
      }));
    });
  }



}
