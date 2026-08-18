import type { Gender } from '../../types/community.ts'

export const avatarSourceDirectory = 'src/assets/Avatar'
export const avatarThumbnailDirectory = 'src/assets/Avatar/thumbs'

const femaleAvatarFiles = [
  'pexels-albarracin-30781749.jpg',
  'pexels-amir-selfish-2150257461-37468749.jpg',
  'pexels-connorscottmcmanus-14768908.jpg',
  'pexels-cottonbro-6766741.jpg',
  'pexels-cottonbro-7231079.jpg',
  'pexels-divinetechygirl-1181686.jpg',
  'pexels-eda-topsakal-151114598-29879737.jpg',
  'pexels-eden-vaknin-492300067-15985474.jpg',
  'pexels-emmanuel-hernandez-54157570-13687480.jpg',
  'pexels-esrakorkmaz-17191688.jpg',
  'pexels-hadi-ahmadi-94969849-17726855.jpg',
  'pexels-hadi-ahmadi-94969849-37805757.jpg',
  'pexels-helenalopes-27086189.jpg',
  'pexels-irakli-tskipurishvili-307184383-14687465.jpg',
  'pexels-karola-g-8558838.jpg',
  'pexels-kimiyashabani-15904405.jpg',
  'pexels-maryam-talepoor-2156366062-34334403.jpg',
  'pexels-maryiaplashchynskaya-7393776.jpg',
  'pexels-maryiaplashchynskaya-7393778.jpg',
  'pexels-mertcoskunraw-32341973.jpg',
  'pexels-meruyert-gonullu-7243388.jpg',
  'pexels-ninazey-14903189.jpg',
  'pexels-oz-art-266259698-17553147.jpg',
  'pexels-pexels-user-25433892-6748783.jpg',
  'pexels-shvets-production-8415177.jpg',
  'pexels-shvetsa-4226466.jpg',
  'pexels-skylake-18300770.jpg',
  'pexels-uday-veeru-2148554804-39030277.jpg',
  'pexels-wbusraca-17705796.jpg',
  'pexels-zandatsu-28069997.jpg',
] as const

const maleAvatarFiles = [
  'pexels-ali-jafar-851025332-37676879.jpg',
  'pexels-annmteu-11395925.jpg',
  'pexels-armando-guarino-2960578-7505457.jpg',
  'pexels-artempodrez-4728851.jpg',
  'pexels-benyamin-ghamgosar-2155842748-34405831.jpg',
  'pexels-cottonbro-6830359.jpg',
  'pexels-estudiopolaroid-3116381.jpg',
  'pexels-farshadsheikhzadeh-14445800.jpg',
  'pexels-gary-barnes-6248998.jpg',
  'pexels-hadi-ahmadi-94969849-11243826.jpg',
  'pexels-hadi-ahmadi-94969849-24916672.jpg',
  'pexels-hadi-ahmadi-94969849-24916808.jpg',
  'pexels-hadi-ahmadi-94969849-37805565.jpg',
  'pexels-italo-melo-881954-2379004.jpg',
  'pexels-izafi-27377102.jpg',
  'pexels-kelly-3812011.jpg',
  'pexels-kevinbidwell-3863793.jpg',
  'pexels-koprivakart-6593238.jpg',
  'pexels-linkedin-1251903.jpg',
  'pexels-norton-alpheu-300282358-17218597.jpg',
  'pexels-olegpodi-11785442.jpg',
  'pexels-ozan-kilic-605466332-31277175.jpg',
  'pexels-ramesh-kumawat-1559683-16444650.jpg',
  'pexels-rupinder-korpal-912878-13750530.jpg',
  'pexels-rupinder-singh-2744173-11091408.jpg',
  'pexels-shiva-kumar-reddy-38385642-37605833.jpg',
  'pexels-shruti-wakode-1478758-10292608.jpg',
  'pexels-spolyakov-16762317.jpg',
  'pexels-steel-l-1695370-33269094.jpg',
  'pexels-wolrider-37409447.jpg',
] as const

const nonbinaryAvatarFiles = ['pexels-mertcoskunraw-32341973.jpg'] as const

export const avatarFiles = [...femaleAvatarFiles, ...maleAvatarFiles] as const

export function avatarFileFor(gender: Gender, genderIndex: number) {
  if (gender === 'زن') return femaleAvatarFiles[genderIndex % femaleAvatarFiles.length]
  if (gender === 'مرد') return maleAvatarFiles[genderIndex % maleAvatarFiles.length]

  return nonbinaryAvatarFiles[genderIndex % nonbinaryAvatarFiles.length]
}

export function avatarThumbnailFileFor(fileName: string) {
  return `${fileName.replace(/\.(jpe?g|png|webp)$/i, '')}.jpg`
}
