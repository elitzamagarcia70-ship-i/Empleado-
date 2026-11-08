// Utilidades para calcular el RFC de persona física (algoritmo SAT)

const quitarAcentos = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/Ñ/gi, 'X');

const limpiar = (s) => quitarAcentos((s || '').toUpperCase().trim()).replace(/[^A-Z ]/g, '');

// Partículas que no se toman en cuenta
const PARTICULAS = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'MC', 'MAC', 'VON', 'VAN', 'DA', 'DI', 'DAS', 'DER', 'MI'];
const quitarParticulas = (s) => s.split(' ').filter((p) => p && !PARTICULAS.includes(p)).join(' ');

// Palabras altisonantes: se cambia la última letra por X
const INCONVENIENTES = ['BUEI','BUEY','CACA','CACO','CAGA','CAGO','CAKA','CAKO','COGE','COJA','COJE','COJI','COJO','CULO','FETO','GUEY','JOTO','KACA','KACO','KAGA','KAGO','KOGE','KOJO','KAKA','KULO','MAME','MAMO','MEAR','MEAS','MEON','MION','MOCO','MULA','PEDA','PEDO','PENE','PUTA','PUTO','QULO','RATA','RUIN'];

export function calcularRFC(nombre, paterno, materno, fecha) {
  let nom = quitarParticulas(limpiar(nombre));
  const pat = quitarParticulas(limpiar(paterno));
  const mat = quitarParticulas(limpiar(materno));

  // Si el nombre es compuesto y empieza con MARIA o JOSE, se usa el segundo
  const partes = nom.split(' ');
  if (partes.length > 1 && ['MARIA', 'MA', 'JOSE', 'J'].includes(partes[0])) nom = partes.slice(1).join(' ');

  let clave;
  if (!mat) {
    clave = pat.substring(0, 2) + nom.substring(0, 2);
  } else if (pat.length < 3) {
    clave = pat[0] + mat[0] + nom.substring(0, 2);
  } else {
    const vocal = (pat.substring(1).match(/[AEIOU]/) || ['X'])[0];
    clave = pat[0] + vocal + mat[0] + nom[0];
  }
  if (INCONVENIENTES.includes(clave)) clave = clave.substring(0, 3) + 'X';

  // Fecha: AAMMDD
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const aa = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  const base = clave + aa + mm + dd;
  const homo = homoclave(`${limpiar(paterno)} ${limpiar(materno)} ${limpiar(nombre)}`.trim());
  const rfc12 = base + homo;
  return rfc12 + digitoVerificador(rfc12);
}

function homoclave(nombreCompleto) {
  const valor = (c) => {
    if (c === ' ') return '00';
    if (c >= '0' && c <= '9') return '0' + c;
    if (c >= 'A' && c <= 'I') return String(c.charCodeAt(0) - 54);   // A=11 … I=19
    if (c >= 'J' && c <= 'R') return String(c.charCodeAt(0) - 53);   // J=21 … R=29
    if (c >= 'S' && c <= 'Z') return String(c.charCodeAt(0) - 51);   // S=32 … Z=39
    return '00';
  };
  const cad = '0' + [...nombreCompleto].map(valor).join('');
  let suma = 0;
  for (let i = 0; i < cad.length - 1; i++) {
    suma += parseInt(cad.substring(i, i + 2)) * parseInt(cad[i + 1]);
  }
  const tres = suma % 1000;
  const tabla = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
  return tabla[Math.floor(tres / 34)] + tabla[tres % 34];
}

function digitoVerificador(rfc12) {
  const dic = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';
  let suma = 0;
  for (let i = 0; i < 12; i++) suma += dic.indexOf(rfc12[i]) * (13 - i);
  const r = suma % 11;
  if (r === 0) return '0';
  const d = 11 - r;
  return d === 10 ? 'A' : String(d);
}
