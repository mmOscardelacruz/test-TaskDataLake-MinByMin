export interface Group {
  id: string;
  color: Color;
  isGlobalReportingGroup: boolean;
  children: Child[];
  comments: Comments;
  reference: string;
  name?: string;
}

export interface Child {
  id: string;
}

export interface Color {
  a: number;
  b: number;
  g: number;
  r: number;
}

export enum Comments {
  CreadoPorOliviaSilva17062021ParaElEquipoDeRuteo = 'Creado por Olivia Silva 17/06/2021 \nPara el equipo de Ruteo',
  CreadoPorOliviaSilva22112021 = 'Creado por Olivia Silva 22/11/2021',
  Empty = '',
  SupervisionRepartoRogelioJCruzCruzBanderilla = 'Supervision Reparto\nRogelio J. Cruz Cruz\nBanderilla',
  SupervisiorRepartoHerónVicenteGarcíaMartinez = 'Supervisior Reparto\nHerón Vicente García\nMartinez',
  SupervisorRepartoAlejandroHerediaEncarnaciónTlalauquitepec = 'Supervisor Reparto\nAlejandro Heredia Encarnación\nTlalauquitepec\n',
  SupervisorRepartoAlejandroHeredíaEncarnaciónTeziutlán = 'Supervisor Reparto\nAlejandro Heredía Encarnación\nTeziutlán',
  SupervisorRepartoAntonioHernandezOrtizBanderilla = 'Supervisor Reparto\nAntonio Hernandez Ortiz\nBanderilla\n',
  SupervisorRepartoIsaidOrtizVenegasPerote = 'Supervisor Reparto\nIsaid Ortiz Venegas\nPerote ',
  UnidadesOperativas = 'Unidades Operativas'
}
