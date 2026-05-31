import type { WordEntry } from '@/types/dictionary';

export const dictionaryData: WordEntry[] = [
  {
    id: '1',
    english: 'serendipity',
    chinese: '意外发现',
    phonetic: '/ˌserənˈdɪpəti/',
    pinyin: 'yì wài fā xiàn',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '意外发现美好事物的能力', english: 'the ability to find beautiful things by accident' },
          { chinese: '机缘巧合', english: 'fortunate coincidence' }
        ]
      }
    ],
    examples: [
      { english: 'Finding that book was pure serendipity.', chinese: '发现那本书纯粹是意外之喜。' },
      { english: 'The discovery of penicillin was a serendipity.', chinese: '青霉素的发现是一个意外之喜。' }
    ],
    synonyms: ['luck', 'fortune', 'chance'],
    antonyms: ['misfortune', 'design']
  },
  {
    id: '2',
    english: 'ephemeral',
    chinese: '短暂的',
    phonetic: '/ɪˈfemərəl/',
    pinyin: 'duǎn zàn de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '短暂的，转瞬即逝的', english: 'lasting for a very short time' },
          { chinese: '朝生暮死的', english: 'living or lasting for only a day' }
        ]
      }
    ],
    examples: [
      { english: 'Fame is often ephemeral.', chinese: '名声往往是短暂的。' },
      { english: 'The beauty of cherry blossoms is ephemeral.', chinese: '樱花之美是短暂的。' }
    ],
    synonyms: ['transient', 'fleeting', 'momentary'],
    antonyms: ['permanent', 'lasting', 'enduring']
  },
  {
    id: '3',
    english: 'resilience',
    chinese: '韧性',
    phonetic: '/rɪˈzɪliəns/',
    pinyin: 'rèn xìng',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '恢复力，韧性', english: 'the ability to recover quickly from difficulties' },
          { chinese: '弹性', english: 'the ability of a substance to spring back into shape' }
        ]
      }
    ],
    examples: [
      { english: 'She showed great resilience after the setback.', chinese: '她在挫折后展现了强大的韧性。' },
      { english: 'The resilience of the human spirit is remarkable.', chinese: '人类精神的韧性是非凡的。' }
    ],
    synonyms: ['toughness', 'elasticity', 'fortitude'],
    antonyms: ['fragility', 'weakness', 'vulnerability']
  },
  {
    id: '4',
    english: 'eloquent',
    chinese: '雄辩的',
    phonetic: '/ˈeləkwənt/',
    pinyin: 'xióng biàn de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '雄辩的，有口才的', english: 'fluent or persuasive in speaking or writing' },
          { chinese: '意味深长的', english: 'clearly expressing or indicating something' }
        ]
      }
    ],
    examples: [
      { english: 'She gave an eloquent speech at the ceremony.', chinese: '她在典礼上做了一场雄辩的演讲。' },
      { english: 'His silence was more eloquent than words.', chinese: '他的沉默比言语更有说服力。' }
    ],
    synonyms: ['articulate', 'expressive', 'fluent'],
    antonyms: ['inarticulate', 'tongue-tied']
  },
  {
    id: '5',
    english: 'nostalgia',
    chinese: '怀旧',
    phonetic: '/nɒˈstældʒə/',
    pinyin: 'huái jiù',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '怀旧，思乡', english: 'a sentimental longing for the past' },
          { chinese: '乡愁', english: 'homesickness' }
        ]
      }
    ],
    examples: [
      { english: 'The old song filled her with nostalgia.', chinese: '那首老歌让她充满了怀旧之情。' },
      { english: 'Nostalgia for the 1990s is common among millennials.', chinese: '千禧一代对90年代的怀旧很普遍。' }
    ],
    synonyms: ['longing', 'yearning', 'homesickness'],
    antonyms: ['indifference', 'apathy']
  },
  {
    id: '6',
    english: 'perseverance',
    chinese: '毅力',
    phonetic: '/ˌpɜːsɪˈvɪərəns/',
    pinyin: 'yì lì',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '毅力，坚持不懈', english: 'persistence in doing something despite difficulty' },
          { chinese: '锲而不舍', english: 'continued effort to achieve something' }
        ]
      }
    ],
    examples: [
      { english: 'His perseverance finally paid off.', chinese: '他的毅力终于得到了回报。' },
      { english: 'Success requires talent and perseverance.', chinese: '成功需要天赋和毅力。' }
    ],
    synonyms: ['persistence', 'determination', 'tenacity'],
    antonyms: ['laziness', 'indolence', 'apathy']
  },
  {
    id: '7',
    english: 'ubiquitous',
    chinese: '无处不在的',
    phonetic: '/juːˈbɪkwɪtəs/',
    pinyin: 'wú chù bù zài de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '无处不在的', english: 'present, appearing, or found everywhere' },
          { chinese: '普遍存在的', english: 'seeming to be seen everywhere' }
        ]
      }
    ],
    examples: [
      { english: 'Smartphones have become ubiquitous in modern life.', chinese: '智能手机在现代生活中已无处不在。' },
      { english: 'Coffee shops are ubiquitous in this city.', chinese: '咖啡店在这座城市无处不在。' }
    ],
    synonyms: ['omnipresent', 'pervasive', 'universal'],
    antonyms: ['rare', 'scarce', 'uncommon']
  },
  {
    id: '8',
    english: 'ambiguous',
    chinese: '模棱两可的',
    phonetic: '/æmˈbɪɡjuəs/',
    pinyin: 'mó léng liǎng kě de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '模棱两可的，含糊的', english: 'open to more than one interpretation' },
          { chinese: '不明确的', english: 'unclear or inexact' }
        ]
      }
    ],
    examples: [
      { english: 'The statement was deliberately ambiguous.', chinese: '该声明故意模棱两可。' },
      { english: 'The ending of the movie is ambiguous.', chinese: '电影的结局模棱两可。' }
    ],
    synonyms: ['vague', 'unclear', 'equivocal'],
    antonyms: ['clear', 'unambiguous', 'explicit']
  },
  {
    id: '9',
    english: 'compassion',
    chinese: '同情心',
    phonetic: '/kəmˈpæʃn/',
    pinyin: 'tóng qíng xīn',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '同情，怜悯', english: 'sympathetic pity and concern for the sufferings of others' },
          { chinese: '慈悲', english: 'deep awareness of the suffering of another' }
        ]
      }
    ],
    examples: [
      { english: 'She showed great compassion for the victims.', chinese: '她对受害者表现出极大的同情心。' },
      { english: 'Compassion is the basis of morality.', chinese: '同情心是道德的基础。' }
    ],
    synonyms: ['empathy', 'sympathy', 'kindness'],
    antonyms: ['cruelty', 'indifference', 'coldness']
  },
  {
    id: '10',
    english: 'pragmatic',
    chinese: '务实的',
    phonetic: '/præɡˈmætɪk/',
    pinyin: 'wù shí de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '务实的，实用主义的', english: 'dealing with things sensibly and realistically' },
          { chinese: '实际的', english: 'relating to practical considerations' }
        ]
      }
    ],
    examples: [
      { english: 'We need a pragmatic approach to this problem.', chinese: '我们需要一种务实的方法来解决这个问题。' },
      { english: 'She is a pragmatic leader who focuses on results.', chinese: '她是一位注重结果的务实领导者。' }
    ],
    synonyms: ['practical', 'realistic', 'sensible'],
    antonyms: ['idealistic', 'impractical', 'theoretical']
  },
  {
    id: '11',
    english: 'melancholy',
    chinese: '忧郁',
    phonetic: '/ˈmelənkɒli/',
    pinyin: 'yōu yù',
    partsOfSpeech: [
      {
        type: 'noun',
        chineseType: '名词',
        meanings: [
          { chinese: '忧郁，悲伤', english: 'a deep, pensive, and long-lasting sadness' }
        ]
      },
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '忧郁的，令人伤感的', english: 'having a feeling of melancholy; sad and pensive' }
        ]
      }
    ],
    examples: [
      { english: 'A sense of melancholy pervaded the novel.', chinese: '忧郁的感觉弥漫着整部小说。' },
      { english: 'The autumn scenery has a melancholy beauty.', chinese: '秋天的景色有一种忧郁的美。' }
    ],
    synonyms: ['sadness', 'sorrow', 'gloom'],
    antonyms: ['happiness', 'joy', 'cheerfulness']
  },
  {
    id: '12',
    english: 'candid',
    chinese: '坦率的',
    phonetic: '/ˈkændɪd/',
    pinyin: 'tǎn shuài de',
    partsOfSpeech: [
      {
        type: 'adjective',
        chineseType: '形容词',
        meanings: [
          { chinese: '坦率的，直言不讳的', english: 'truthful and straightforward; frank' },
          { chinese: '偷拍的', english: 'taken informally, especially without the subject knowing' }
        ]
      }
    ],
    examples: [
      { english: 'He was refreshingly candid about his mistakes.', chinese: '他对自己的错误坦率得令人耳目一新。' },
      { english: 'I appreciate your candid feedback.', chinese: '我感谢你坦率的反馈。' }
    ],
    synonyms: ['frank', 'honest', 'straightforward'],
    antonyms: ['deceptive', 'evasive', 'dishonest']
  }
];

export const dailyWords: WordEntry[] = [
  dictionaryData[0],
  dictionaryData[1],
  dictionaryData[2],
  dictionaryData[3],
  dictionaryData[4],
  dictionaryData[5],
  dictionaryData[6]
];
