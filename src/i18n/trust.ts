/**
 * Trust UI strings — "Released & Bitcoin-anchored" release attestations and the
 * one-click verify surface (shared family component: components/trust/HowProofWorks).
 *
 * Kept in one module so every locale stays in lockstep and the promise language
 * ("anchored", "not proven", "checked by") can never drift between languages.
 * Longer explainer sentences fall back to the shared component's English copy
 * (see the i18n follow-up note in docs/KIMI-HANDOFF.md).
 */

const en = {
  'trust.release.eyebrow': 'Released & Bitcoin-anchored',
  'trust.release.verify': 'Verify this release',
  'trust.release.verifying': 'Checking Bitcoin…',
  'trust.release.retry': 'Check again',
  'trust.release.downloadOts': 'Download the proof (.ots)',
  'trust.release.downloadArtifact': 'Download the exact file',
  'trust.release.method': 'Checked by',
  'trust.release.methodNode': "Katoa's own Bitcoin node (bitcoind)",
  'trust.release.methodExplorer': 'A public Bitcoin explorer (esplora)',
  'trust.release.error':
    'We could not reach the Bitcoin checker. Nothing was verified — not proven, not disproven.',
  'trust.release.sectionTitle': 'Release attestations',
  'trust.release.sectionLead':
    'Each release below is fingerprinted, anchored to a Bitcoin block, and checked live when you press verify. No account needed.',
  'trust.proof.statePendingTitle': 'Waiting for Bitcoin',
  'trust.proof.stateConfirmedTitle': 'Anchored to Bitcoin',
  'trust.proof.stateNotProvenTitle': 'Not proven',
  'trust.proof.blockLabel': 'Bitcoin block',
  'trust.proof.showSteps': 'Show me how',
  'trust.proof.hideSteps': 'Hide',
  'verify.page.title': 'Check a release',
  'verify.page.lead':
    'Paste the SHA-256 of a released file. We ask the Bitcoin blockchain, and we show you exactly how it was checked — plus the proof file so you never have to take our word.',
  'verify.page.button': 'Check this hash',
  'verify.page.invalid': 'That is not a SHA-256 hash. It must be exactly 64 hex characters.',
};

const es = {
  'trust.release.eyebrow': 'Publicado y anclado en Bitcoin',
  'trust.release.verify': 'Verificar esta publicación',
  'trust.release.verifying': 'Consultando Bitcoin…',
  'trust.release.retry': 'Comprobar de nuevo',
  'trust.release.downloadOts': 'Descargar la prueba (.ots)',
  'trust.release.downloadArtifact': 'Descargar el archivo exacto',
  'trust.release.method': 'Comprobado con',
  'trust.release.methodNode': 'El propio nodo Bitcoin de Katoa (bitcoind)',
  'trust.release.methodExplorer': 'Un explorador público de Bitcoin (esplora)',
  'trust.release.error':
    'No pudimos contactar con el verificador de Bitcoin. Nada quedó verificado: ni probado ni refutado.',
  'trust.release.sectionTitle': 'Attestaciones de publicación',
  'trust.release.sectionLead':
    'Cada publicación se huella, se ancla a un bloque de Bitcoin y se comprueba en vivo al pulsar verificar. Sin cuenta.',
  'trust.proof.statePendingTitle': 'Esperando a Bitcoin',
  'trust.proof.stateConfirmedTitle': 'Anclado en Bitcoin',
  'trust.proof.stateNotProvenTitle': 'No probado',
  'trust.proof.blockLabel': 'Bloque de Bitcoin',
  'trust.proof.showSteps': 'Muéstrame cómo',
  'trust.proof.hideSteps': 'Ocultar',
  'verify.page.title': 'Comprobar una publicación',
  'verify.page.lead':
    'Pega el SHA-256 de un archivo publicado. Preguntamos a la blockchain de Bitcoin y te mostramos exactamente cómo se comprobó, además del archivo de prueba para que no tengas que fiarte de nuestra palabra.',
  'verify.page.button': 'Comprobar este hash',
  'verify.page.invalid': 'Eso no es un hash SHA-256. Debe tener exactamente 64 caracteres hexadecimales.',
};

const pt = {
  'trust.release.eyebrow': 'Publicado e ancorado no Bitcoin',
  'trust.release.verify': 'Verificar este lançamento',
  'trust.release.verifying': 'Consultando o Bitcoin…',
  'trust.release.retry': 'Verificar novamente',
  'trust.release.downloadOts': 'Baixar a prova (.ots)',
  'trust.release.downloadArtifact': 'Baixar o arquivo exato',
  'trust.release.method': 'Verificado com',
  'trust.release.methodNode': 'O próprio nó Bitcoin da Katoa (bitcoind)',
  'trust.release.methodExplorer': 'Um explorador público de Bitcoin (esplora)',
  'trust.release.error':
    'Não conseguimos alcançar o verificador de Bitcoin. Nada foi verificado — nem provado, nem refutado.',
  'trust.release.sectionTitle': 'Atestados de lançamento',
  'trust.release.sectionLead':
    'Cada lançamento é impresso digitalmente, ancorado num bloco de Bitcoin e conferido ao vivo quando você clica em verificar. Sem conta.',
  'trust.proof.statePendingTitle': 'Aguardando o Bitcoin',
  'trust.proof.stateConfirmedTitle': 'Ancorado no Bitcoin',
  'trust.proof.stateNotProvenTitle': 'Não provado',
  'trust.proof.blockLabel': 'Bloco de Bitcoin',
  'trust.proof.showSteps': 'Mostre-me como',
  'trust.proof.hideSteps': 'Ocultar',
  'verify.page.title': 'Conferir um lançamento',
  'verify.page.lead':
    'Cole o SHA-256 de um arquivo publicado. Perguntamos à blockchain do Bitcoin e mostramos exatamente como foi conferido — além do arquivo de prova, para você nunca precisar confiar na nossa palavra.',
  'verify.page.button': 'Conferir este hash',
  'verify.page.invalid': 'Isso não é um hash SHA-256. Precisa ter exatamente 64 caracteres hexadecimais.',
};

const fr = {
  'trust.release.eyebrow': 'Publié et ancré dans Bitcoin',
  'trust.release.verify': 'Vérifier cette publication',
  'trust.release.verifying': 'Interrogation de Bitcoin…',
  'trust.release.retry': 'Vérifier à nouveau',
  'trust.release.downloadOts': 'Télécharger la preuve (.ots)',
  'trust.release.downloadArtifact': 'Télécharger le fichier exact',
  'trust.release.method': 'Vérifié via',
  'trust.release.methodNode': 'Le propre nœud Bitcoin de Katoa (bitcoind)',
  'trust.release.methodExplorer': 'Un explorateur Bitcoin public (esplora)',
  'trust.release.error':
    'Le vérificateur Bitcoin est injoignable. Rien n’a été vérifié — ni prouvé, ni réfuté.',
  'trust.release.sectionTitle': 'Attestations de publication',
  'trust.release.sectionLead':
    'Chaque publication est empreintée, ancrée dans un bloc Bitcoin, puis vérifiée en direct quand vous cliquez. Aucun compte requis.',
  'trust.proof.statePendingTitle': 'En attente de Bitcoin',
  'trust.proof.stateConfirmedTitle': 'Ancré dans Bitcoin',
  'trust.proof.stateNotProvenTitle': 'Non prouvé',
  'trust.proof.blockLabel': 'Bloc Bitcoin',
  'trust.proof.showSteps': 'Montrez-moi comment',
  'trust.proof.hideSteps': 'Masquer',
  'verify.page.title': 'Vérifier une publication',
  'verify.page.lead':
    'Collez le SHA-256 d’un fichier publié. Nous interrogeons la blockchain Bitcoin et montrons exactement comment la vérification a été faite — avec le fichier de preuve, pour que vous n’ayez jamais à nous croire sur parole.',
  'verify.page.button': 'Vérifier ce hash',
  'verify.page.invalid': 'Ce n’est pas un hash SHA-256. Il doit comporter exactement 64 caractères hexadécimaux.',
};

const de = {
  'trust.release.eyebrow': 'Veröffentlicht & in Bitcoin verankert',
  'trust.release.verify': 'Diese Veröffentlichung prüfen',
  'trust.release.verifying': 'Bitcoin wird abgefragt…',
  'trust.release.retry': 'Erneut prüfen',
  'trust.release.downloadOts': 'Beweis herunterladen (.ots)',
  'trust.release.downloadArtifact': 'Die exakte Datei herunterladen',
  'trust.release.method': 'Geprüft über',
  'trust.release.methodNode': 'Katoas eigener Bitcoin-Node (bitcoind)',
  'trust.release.methodExplorer': 'Ein öffentlicher Bitcoin-Explorer (esplora)',
  'trust.release.error':
    'Der Bitcoin-Prüfer war nicht erreichbar. Nichts wurde verifiziert — weder bewiesen noch widerlegt.',
  'trust.release.sectionTitle': 'Release-Attestierungen',
  'trust.release.sectionLead':
    'Jede Veröffentlichung wird gefingerprintet, in einem Bitcoin-Block verankert und beim Klick live geprüft. Kein Konto nötig.',
  'trust.proof.statePendingTitle': 'Warten auf Bitcoin',
  'trust.proof.stateConfirmedTitle': 'In Bitcoin verankert',
  'trust.proof.stateNotProvenTitle': 'Nicht bewiesen',
  'trust.proof.blockLabel': 'Bitcoin-Block',
  'trust.proof.showSteps': 'Zeig mir wie',
  'trust.proof.hideSteps': 'Ausblenden',
  'verify.page.title': 'Eine Veröffentlichung prüfen',
  'verify.page.lead':
    'Füge den SHA-256 einer veröffentlichten Datei ein. Wir fragen die Bitcoin-Blockchain und zeigen genau, wie geprüft wurde — samt Beweisdatei, damit du uns nie glauben musst.',
  'verify.page.button': 'Diesen Hash prüfen',
  'verify.page.invalid': 'Das ist kein SHA-256-Hash. Er muss genau 64 Hexadezimalzeichen haben.',
};

const ja = {
  'trust.release.eyebrow': 'リリース済み・Bitcoinにアンカー済み',
  'trust.release.verify': 'このリリースを検証',
  'trust.release.verifying': 'Bitcoinを確認中…',
  'trust.release.retry': 'もう一度検証',
  'trust.release.downloadOts': '証明ファイル（.ots）をダウンロード',
  'trust.release.downloadArtifact': '正確なファイルをダウンロード',
  'trust.release.method': '検証方法',
  'trust.release.methodNode': 'Katoa自身のBitcoinノード（bitcoind）',
  'trust.release.methodExplorer': '公開Bitcoinエクスプローラー（esplora）',
  'trust.release.error':
    'Bitcoinの検証サーバーに接続できませんでした。何も検証されていません（証明も反証もされていません）。',
  'trust.release.sectionTitle': 'リリースの証明',
  'trust.release.sectionLead':
    '各リリースは指紋を取り、Bitcoinブロックにアンカーされ、検証ボタンでその場で確認されます。アカウントは不要です。',
  'trust.proof.statePendingTitle': 'Bitcoinの確認待ち',
  'trust.proof.stateConfirmedTitle': 'Bitcoinにアンカー済み',
  'trust.proof.stateNotProvenTitle': '証明されず',
  'trust.proof.blockLabel': 'Bitcoinブロック',
  'trust.proof.showSteps': '手順を見る',
  'trust.proof.hideSteps': '閉じる',
  'verify.page.title': 'リリースを確認する',
  'verify.page.lead':
    '公開ファイルのSHA-256を貼り付けてください。Bitcoinブロックチェーンに問い合わせ、どのように検証したかを明示し、証明ファイルも渡します。私たちの言葉を信じる必要はありません。',
  'verify.page.button': 'このハッシュを確認',
  'verify.page.invalid': 'これはSHA-256ハッシュではありません。16進数64文字である必要があります。',
};

const zh = {
  'trust.release.eyebrow': '已发布 · 锚定于比特币',
  'trust.release.verify': '验证此次发布',
  'trust.release.verifying': '正在查询比特币…',
  'trust.release.retry': '重新验证',
  'trust.release.downloadOts': '下载证明文件（.ots）',
  'trust.release.downloadArtifact': '下载完全一致的文件',
  'trust.release.method': '验证方式',
  'trust.release.methodNode': 'Katoa 自有的比特币节点（bitcoind）',
  'trust.release.methodExplorer': '公共比特币浏览器（esplora）',
  'trust.release.error': '无法连接比特币验证器。什么都没有被验证——既未证明，也未推翻。',
  'trust.release.sectionTitle': '发布证明',
  'trust.release.sectionLead':
    '每一项发布都会生成指纹、锚定到比特币区块，并在你点击验证时实时核验。无需账号。',
  'trust.proof.statePendingTitle': '等待比特币确认',
  'trust.proof.stateConfirmedTitle': '已锚定于比特币',
  'trust.proof.stateNotProvenTitle': '未获证明',
  'trust.proof.blockLabel': '比特币区块',
  'trust.proof.showSteps': '告诉我怎么做',
  'trust.proof.hideSteps': '收起',
  'verify.page.title': '核验一次发布',
  'verify.page.lead':
    '粘贴已发布文件的 SHA-256。我们询问比特币区块链，并明确告诉你它是如何被核验的，同时给出证明文件——你不必相信我们的话。',
  'verify.page.button': '核验此哈希',
  'verify.page.invalid': '这不是 SHA-256 哈希。它必须正好是 64 个十六进制字符。',
};

export const trustStrings = { en, es, pt, fr, de, ja, zh };
