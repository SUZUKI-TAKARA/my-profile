import { useMemo, useState } from 'react';

const back = [
  '香',
  '桂',
  '銀',
  '金',
  '王',
  '金',
  '銀',
  '桂',
  '香',
];

// ========================================
// 初期盤面を作る
// ========================================
const start = () => {
  const b = Array(81).fill(null);

  // ========================================
  // 後手
  // ========================================

  // 1段目
  back.forEach((piece, i) => {
    b[i] = {
      p: piece,
      side: 'b',
      promoted: false,
    };
  });

  // 飛車
  b[9 + 1] = {
    p: '飛',
    side: 'b',
    promoted: false,
  };

  // 角
  b[9 + 7] = {
    p: '角',
    side: 'b',
    promoted: false,
  };

  // 歩
  for (let i = 0; i < 9; i++) {
    b[18 + i] = {
      p: '歩',
      side: 'b',
      promoted: false,
    };
  }

  // ========================================
  // 先手
  // ========================================

  // 9段目
  back.forEach((piece, i) => {
    b[72 + i] = {
      p: piece,
      side: 'w',
      promoted: false,
    };
  });

  // 角
  b[63 + 1] = {
    p: '角',
    side: 'w',
    promoted: false,
  };

  // 飛車
  b[63 + 7] = {
    p: '飛',
    side: 'w',
    promoted: false,
  };

  // 歩
  for (let i = 0; i < 9; i++) {
    b[54 + i] = {
      p: '歩',
      side: 'w',
      promoted: false,
    };
  }

  return b;
};

// ========================================
// 通常の駒の動き
//
// すべて「前」を上方向として定義
// ========================================
const dirs = {
  歩: [[0, -1]],

  金: [
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
  ],

  王: [
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
    [-1, 1],
    [1, 1],
  ],

  銀: [
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],

  桂: [
    [-1, -2],
    [1, -2],
  ],
};

// ========================================
// 複数マス移動できる通常駒
// ========================================
const slide = {
  飛: [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ],

  角: [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],

  香: [[0, -1]],
};

// ========================================
// 成駒の名前
// ========================================
const promotedName = {
  歩: 'と',
  香: '杏',
  桂: '圭',
  銀: '全',
  角: '馬',
  飛: '竜',
};

// ========================================
// 成駒を含めた表示名を取得
// ========================================
const getDisplayName = (piece) => {
  if (!piece) {
    return '';
  }

  if (piece.promoted) {
    return promotedName[piece.p] || piece.p;
  }

  return piece.p;
};

// ========================================
// 成れる駒か
// ========================================
const canPromote = (piece) => {
  if (!piece) {
    return false;
  }

  // すでに成っている駒は
  // もう一度成ることはできない
  if (piece.promoted) {
    return false;
  }

  return [
    '歩',
    '香',
    '桂',
    '銀',
    '角',
    '飛',
  ].includes(piece.p);
};

// ========================================
// 成った駒の動きを取得
// ========================================
const getPromotedMoves = (piece) => {
  // ======================================
  // と・成香・成桂・成銀
  // → 金と同じ
  // ======================================
  if (
    ['歩', '香', '桂', '銀'].includes(piece.p)
  ) {
    return {
      step: dirs.金,
      slide: [],
    };
  }

  // ======================================
  // 竜
  //
  // 飛車
  // ＋
  // 斜め1マス
  // ======================================
  if (piece.p === '飛') {
    return {
      step: [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
      slide: slide.飛,
    };
  }

  // ======================================
  // 馬
  //
  // 角
  // ＋
  // 縦横1マス
  // ======================================
  if (piece.p === '角') {
    return {
      step: [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ],
      slide: slide.角,
    };
  }

  return {
    step: [],
    slide: [],
  };
};

// ========================================
// 駒の移動可能マスを計算
// ========================================
const legal = (board, from, turn) => {
  const piece = board[from];

  if (!piece || piece.side !== turn) {
    return [];
  }

  const x = from % 9;
  const y = Math.floor(from / 9);

  /*
   * 現在の設定
   *
   * b → 上方向
   * w → 下方向
   */
  const forward = turn === 'b' ? -1 : 1;

  const moves = [];

  // ========================================
  // 1方向に進む
  // ========================================
  const add = (
    dx,
    dy,
    repeat = false,
  ) => {
    let nx = x + dx;
    let ny = y + dy;

    while (
      nx >= 0 &&
      nx < 9 &&
      ny >= 0 &&
      ny < 9
    ) {
      const n = ny * 9 + nx;

      // 自分の駒がある
      if (board[n]?.side === turn) {
        break;
      }

      moves.push(n);

      // 相手の駒がある
      if (board[n] || !repeat) {
        break;
      }

      nx += dx;
      ny += dy;
    }
  };

  // ========================================
  // 成っている場合
  // ========================================
  if (piece.promoted) {
    const promotedMoves =
      getPromotedMoves(piece);

    // 1マス
    promotedMoves.step.forEach(
      ([dx, dy]) => {
        add(dx, dy * forward);
      },
    );

    // 複数マス
    promotedMoves.slide.forEach(
      ([dx, dy]) => {
        add(
          dx,
          dy * forward,
          true,
        );
      },
    );

    return moves;
  }

  // ========================================
  // 通常の駒
  // ========================================
  (dirs[piece.p] || []).forEach(
    ([dx, dy]) => {
      add(dx, dy * forward);
    },
  );

  (slide[piece.p] || []).forEach(
    ([dx, dy]) => {
      add(
        dx,
        dy * forward,
        true,
      );
    },
  );

  return moves;
};

// ========================================
// 敵陣に入っているか
//
// 今回の盤面設定では
//
// b → 下側3段
// w → 上側3段
// ========================================
const isInEnemyCamp = (
  index,
  side,
) => {
  const y = Math.floor(index / 9);

  if (side === 'b') {
    return y >= 6;
  }

  return y <= 2;
};

// ========================================
// 成れる条件
// ========================================
const canPromoteAtMove = (
  piece,
  from,
  to,
) => {
  if (!canPromote(piece)) {
    return false;
  }

  return (
    isInEnemyCamp(
      from,
      piece.side,
    ) ||
    isInEnemyCamp(
      to,
      piece.side,
    )
  );
};

// ========================================
// 必ず成らなければいけないか
// ========================================
const mustPromoteAtMove = (
  piece,
  to,
) => {
  const y = Math.floor(to / 9);

  // --------------------------------------
  // b
  // --------------------------------------
  if (piece.side === 'b') {
    // 歩・香が最上段
    if (
      ['歩', '香'].includes(
        piece.p,
      ) &&
      y === 0
    ) {
      return true;
    }

    // 桂が上から2段以内
    if (
      piece.p === '桂' &&
      y <= 1
    ) {
      return true;
    }
  }

  // --------------------------------------
  // w
  // --------------------------------------
  if (piece.side === 'w') {
    // 歩・香が最下段
    if (
      ['歩', '香'].includes(
        piece.p,
      ) &&
      y === 8
    ) {
      return true;
    }

    // 桂が下から2段以内
    if (
      piece.p === '桂' &&
      y >= 7
    ) {
      return true;
    }
  }

  return false;
};

// ========================================
// 二歩判定
//
// 指定された筋に、自分の「成っていない歩」が
// すでに存在するか確認する
// ========================================
const hasUnpromotedPawnInFile = (
  board,
  side,
  file,
) => {
  for (let y = 0; y < 9; y++) {
    const index =
      y * 9 + file;

    const piece = board[index];

    if (
      piece &&
      piece.side === side &&
      piece.p === '歩' &&
      piece.promoted === false
    ) {
      return true;
    }
  }

  return false;
};

// ========================================
// 歩を打てるか
// ========================================
const canDropPawn = (
  board,
  side,
  index,
) => {
  const file = index % 9;

  return !hasUnpromotedPawnInFile(
    board,
    side,
    file,
  );
};

// ========================================
// App
// ========================================
function App() {
  const [board, setBoard] =
    useState(start());

  const [turn, setTurn] =
    useState('b');

  // 盤上で選択中の駒
  const [selected, setSelected] =
    useState(null);

  // 持ち駒で選択中の駒
  const [selectedHand, setSelectedHand] =
    useState(null);

  // 成るかどうか確認中
  const [promotionPending, setPromotionPending] =
    useState(null);

  // 持ち駒
  const [hands, setHands] =
    useState({
      b: [],
      w: [],
    });

  // メッセージ
  const [message, setMessage] =
    useState(
      '先手の番です。駒を選んでください。',
    );

  // 対局終了
  const [gameOver, setGameOver] =
    useState(false);

  // 勝者
  const [winner, setWinner] =
    useState(null);

  // ========================================
  // 選択中の駒が動ける場所
  // ========================================
  const moves = useMemo(() => {
    if (
      selected === null ||
      gameOver
    ) {
      return [];
    }

    return legal(
      board,
      selected,
      turn,
    );
  }, [
    board,
    selected,
    turn,
    gameOver,
  ]);

  // ========================================
  // 持ち駒を選択
  // ========================================
  const selectHand = (
    piece,
    index,
  ) => {
    if (
      promotionPending ||
      gameOver
    ) {
      return;
    }

    setSelected(null);

    // 同じ駒をクリックしたら解除
    if (
      selectedHand &&
      selectedHand.piece === piece &&
      selectedHand.index === index
    ) {
      setSelectedHand(null);

      setMessage(
        '持ち駒の選択を解除しました。',
      );

      return;
    }

    setSelectedHand({
      piece,
      index,
    });

    setMessage(
      `${piece}を選択中です。盤面の空いているマスをクリックしてください。`,
    );
  };

  // ========================================
  // 成る処理
  // ========================================
  const promote = () => {
    if (
      !promotionPending ||
      gameOver
    ) {
      return;
    }

    const {
      index,
      nextTurn,
    } = promotionPending;

    setBoard((currentBoard) => {
      const next = [
        ...currentBoard,
      ];

      next[index] = {
        ...next[index],
        promoted: true,
      };

      return next;
    });

    setPromotionPending(null);

    setTurn(nextTurn);

    setMessage(
      nextTurn === 'b'
        ? '先手の番です。'
        : '後手の番です。',
    );
  };

  // ========================================
  // 成らない処理
  // ========================================
  const doNotPromote = () => {
    if (
      !promotionPending ||
      gameOver
    ) {
      return;
    }

    const {
      nextTurn,
    } = promotionPending;

    setPromotionPending(null);

    setTurn(nextTurn);

    setMessage(
      nextTurn === 'b'
        ? '先手の番です。'
        : '後手の番です。',
    );
  };

  // ========================================
  // 盤面をクリック
  // ========================================
  const click = (i) => {
    if (gameOver) {
      return;
    }

    // 成るかどうか選択中なら操作しない
    if (promotionPending) {
      return;
    }

    // ======================================
    // 持ち駒を選択中
    // ======================================
    if (selectedHand !== null) {
      // 駒がある場所には置けない
      if (board[i] !== null) {
        setMessage(
          '駒があるマスには持ち駒を置けません。',
        );

        return;
      }

      const piece =
        selectedHand.piece;

      // ====================================
      // 二歩チェック
      // ====================================
      if (
        piece === '歩' &&
        !canDropPawn(
          board,
          turn,
          i,
        )
      ) {
        setMessage(
          '二歩になるため、ここに歩を打てません。',
        );

        return;
      }

      const next = [
        ...board,
      ];

      next[i] = {
        p: piece,
        side: turn,
        promoted: false,
      };

      setBoard(next);

      // ------------------------------------
      // 持ち駒から1枚削除
      // ------------------------------------
      setHands((h) => {
        const nextHand = [
          ...h[turn],
        ];

        nextHand.splice(
          selectedHand.index,
          1,
        );

        return {
          ...h,
          [turn]: nextHand,
        };
      });

      setSelectedHand(null);
      setSelected(null);

      // ------------------------------------
      // 手番変更
      // ------------------------------------
      const nextTurn =
        turn === 'b'
          ? 'w'
          : 'b';

      setTurn(nextTurn);

      setMessage(
        nextTurn === 'b'
          ? '先手の番です。'
          : '後手の番です。',
      );

      return;
    }

    // ======================================
    // 盤上の駒を移動
    // ======================================
    if (
      selected !== null &&
      moves.includes(i)
    ) {
      const next = [
        ...board,
      ];

      const movingPiece =
        next[selected];

      const taken = next[i];

      // ------------------------------------
      // 駒を移動
      // ------------------------------------
      next[i] = {
        ...movingPiece,
      };

      next[selected] = null;

      // ------------------------------------
      // 王を取った場合
      // ------------------------------------
      if (
        taken?.p === '王'
      ) {
        setBoard(next);

        setSelected(null);
        setSelectedHand(null);
        setPromotionPending(null);

        const winningSide =
          turn;

        setWinner(
          winningSide,
        );

        setGameOver(true);

        setMessage(
          winningSide === 'b'
            ? '先手の勝ちです！'
            : '後手の勝ちです！',
        );

        return;
      }

      // ------------------------------------
      // 相手の駒を取った場合
      // ------------------------------------
      if (taken) {
        /*
         * 成った駒を取った場合も、
         * 持ち駒になるときは元の駒に戻る。
         *
         * と → 歩
         * 杏 → 香
         * 圭 → 桂
         * 全 → 銀
         * 馬 → 角
         * 竜 → 飛
         */
        setHands((h) => ({
          ...h,
          [turn]: [
            ...h[turn],
            taken.p,
          ],
        }));
      }

      setBoard(next);

      setSelected(null);
      setSelectedHand(null);

      // ====================================
      // 成れるか確認
      // ====================================
      const canPromoteNow =
        canPromoteAtMove(
          movingPiece,
          selected,
          i,
        );

      const mustPromoteNow =
        mustPromoteAtMove(
          movingPiece,
          i,
        );

      // ------------------------------------
      // 次の手番
      // ------------------------------------
      const nextTurn =
        turn === 'b'
          ? 'w'
          : 'b';

      // ====================================
      // 強制的に成る
      // ====================================
      if (mustPromoteNow) {
        next[i] = {
          ...next[i],
          promoted: true,
        };

        setBoard(next);

        setTurn(nextTurn);

        setMessage(
          `${getDisplayName(
            movingPiece,
          )}が成りました。${
            nextTurn === 'b'
              ? '先手の番です。'
              : '後手の番です。'
          }`,
        );

        return;
      }

      // ====================================
      // 成るか選択できる
      // ====================================
      if (canPromoteNow) {
        setPromotionPending({
          index: i,
          nextTurn,
        });

        setMessage(
          `${getDisplayName(
            movingPiece,
          )}が敵陣に入りました。成りますか？`,
        );

        return;
      }

      // ====================================
      // 成らない場合
      // ====================================
      setTurn(nextTurn);

      setMessage(
        nextTurn === 'b'
          ? '先手の番です。'
          : '後手の番です。',
      );

      return;
    }

    // ======================================
    // 自分の駒を選択
    // ======================================
    if (
      board[i]?.side === turn
    ) {
      setSelectedHand(null);

      setSelected(i);

      setMessage(
        `${getDisplayName(
          board[i],
        )}を選択中です。光っているマスへ動かせます。`,
      );

      return;
    }

    // ======================================
    // その他
    // ======================================
    setSelected(null);
    setSelectedHand(null);

    setMessage(
      '自分の駒、または持ち駒を選んでください。',
    );
  };

  // ========================================
  // リセット
  // ========================================
  const reset = () => {
    setBoard(start());

    setTurn('b');

    setSelected(null);

    setSelectedHand(null);

    setPromotionPending(null);

    setHands({
      b: [],
      w: [],
    });

    setMessage(
      '先手の番です。駒を選んでください。',
    );

    setGameOver(false);

    setWinner(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f0e5] text-stone-800">

      {/* ====================================
          ヘッダー
      ==================================== */}
      <header className="border-b border-stone-300 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">

          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-red-800">
              JAPANESE CHESS
            </p>

            <h1 className="font-serif text-3xl font-bold">
              将棋
            </h1>
          </div>

          <button
            onClick={reset}
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700"
          >
            最初から
          </button>

        </div>
      </header>

      {/* ====================================
          メイン
      ==================================== */}
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-7 lg:grid-cols-[1fr_280px]">

        {/* ==================================
            将棋盤側
        ================================== */}
        <section>

          {/* ==================================
              ターン
          ================================== */}
          <div className="mb-3 flex items-center justify-between">

            <h2 className="font-bold">
              対局盤
            </h2>

            <span
              className={
                gameOver
                  ? 'rounded-full bg-stone-600 px-3 py-1 text-sm font-bold text-white'
                  : turn === 'b'
                    ? 'rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white'
                    : 'rounded-full bg-slate-700 px-3 py-1 text-sm font-bold text-white'
              }
            >
              {gameOver
                ? '対局終了'
                : turn === 'b'
                  ? '先手の番'
                  : '後手の番'}
            </span>

          </div>

          {/* ==================================
              後手の持ち駒
          ================================== */}
          <section className="mb-3 rounded-xl border border-stone-300 bg-white p-3 shadow-sm">

            <div className="mb-2 flex items-center justify-between">

              <h3 className="font-bold">
                後手の持ち駒
              </h3>

              <span className="text-xs text-slate-500">
                {turn === 'b' && !gameOver
                  ? '選択できます'
                  : ''}
              </span>

            </div>

            <div className="flex min-h-12 flex-wrap gap-2">

              {hands.b.length === 0 ? (
                <span className="text-sm text-slate-400">
                  なし
                </span>
              ) : (
                hands.b.map(
                  (piece, index) => (
                    <button
                      key={`${piece}-${index}`}
                      disabled={gameOver}
                      onClick={() => {
                        if (gameOver) {
                          return;
                        }

                        if (
                          turn === 'b'
                        ) {
                          selectHand(
                            piece,
                            index,
                          );
                        } else {
                          setMessage(
                            '今は先手の番です。',
                          );
                        }
                      }}
                      className={
                        selectedHand?.piece ===
                          piece &&
                        selectedHand?.index ===
                          index
                          ? 'min-w-12 rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 text-xl font-bold text-stone-900'
                          : 'min-w-12 rounded-lg border border-stone-300 bg-[#dfb36d] px-3 py-2 text-xl font-bold text-stone-900 hover:bg-[#e8c27f]'
                      }
                    >
                      <span
                        className="inline-block"
                        style={{
                          transform:
                            'rotate(180deg)',
                        }}
                      >
                        {piece}
                      </span>
                    </button>
                  ),
                )
              )}

            </div>

          </section>

          {/* ==================================
              将棋盤
          ================================== */}
          <div className="grid grid-cols-9 border-4 border-[#6b4528] bg-[#dfb36d] shadow-xl">

            {board.map(
              (piece, i) => (
                <button
                  key={i}
                  onClick={() =>
                    click(i)
                  }
                  className={
                    (selected === i
                      ? 'bg-yellow-200/80 '
                      : moves.includes(i)
                        ? 'bg-emerald-300/70 '
                        : '') +
                    'aspect-square border border-[#8c6239]/60 text-center text-lg font-bold transition hover:bg-white/25 sm:text-2xl'
                  }
                >

                  {piece && (
                    <span
                      className="inline-block text-stone-900"
                      style={{
                        display:
                          'inline-block',

                        /*
                         * bは180度回転
                         * wは通常向き
                         */
                        transform:
                          piece.side === 'b'
                            ? 'rotate(180deg)'
                            : 'none',

                        transformOrigin:
                          'center center',
                      }}
                    >
                      {getDisplayName(
                        piece,
                      )}
                    </span>
                  )}

                </button>
              ),
            )}

          </div>

          {/* ==================================
              先手の持ち駒
          ================================== */}
          <section className="mt-3 rounded-xl border border-stone-300 bg-white p-3 shadow-sm">

            <div className="mb-2 flex items-center justify-between">

              <h3 className="font-bold">
                先手の持ち駒
              </h3>

              <span className="text-xs text-slate-500">
                {turn === 'w' && !gameOver
                  ? '選択できます'
                  : ''}
              </span>

            </div>

            <div className="flex min-h-12 flex-wrap gap-2">

              {hands.w.length === 0 ? (
                <span className="text-sm text-slate-400">
                  なし
                </span>
              ) : (
                hands.w.map(
                  (piece, index) => (
                    <button
                      key={`${piece}-${index}`}
                      disabled={gameOver}
                      onClick={() => {
                        if (gameOver) {
                          return;
                        }

                        if (
                          turn === 'w'
                        ) {
                          selectHand(
                            piece,
                            index,
                          );
                        } else {
                          setMessage(
                            '今は後手の番です。',
                          );
                        }
                      }}
                      className={
                        selectedHand?.piece ===
                          piece &&
                        selectedHand?.index ===
                          index
                          ? 'min-w-12 rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 text-xl font-bold text-stone-900'
                          : 'min-w-12 rounded-lg border border-stone-300 bg-[#dfb36d] px-3 py-2 text-xl font-bold text-stone-900 hover:bg-[#e8c27f]'
                      }
                    >
                      {piece}
                    </button>
                  ),
                )
              )}

            </div>

          </section>

          {/* ==================================
              メッセージ
          ================================== */}
          <div className="mt-3 rounded-xl border border-stone-300 bg-white px-4 py-3 shadow-sm">

            <p className="text-sm text-stone-600">
              {message}
            </p>

          </div>

        </section>

        {/* ==================================
            右側
        ================================== */}
        <aside className="space-y-4">

          {/* 対局状況 */}
          <section className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm">

            <p className="text-xs font-bold tracking-widest text-stone-400">
              STATUS
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {gameOver
                ? '対局終了'
                : turn === 'b'
                  ? '先手の番'
                  : '後手の番'}
            </h2>

            {gameOver && (
              <p className="mt-3 font-bold text-red-700">
                {winner === 'b'
                  ? '先手の勝ち！'
                  : '後手の勝ち！'}
              </p>
            )}

          </section>

          {/* 操作方法 */}
          <section className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm">

            <h2 className="font-bold">
              操作方法
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">

              <li>
                ・自分の駒をクリックすると、動ける場所が表示されます。
              </li>

              <li>
                ・光っているマスをクリックすると駒を動かせます。
              </li>

              <li>
                ・持ち駒をクリックしてから、空いているマスをクリックすると駒を打てます。
              </li>

              <li>
                ・同じ筋に未成の歩がある場合、その筋には歩を打てません。
              </li>

              <li>
                ・成れる場合は「成る / 成らない」を選択できます。
              </li>

              <li>
                ・王を取ると対局終了です。
              </li>

            </ul>

          </section>

        </aside>

      </div>

      {/* ====================================
          成り選択モーダル
      ==================================== */}
      {promotionPending &&
        !gameOver && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">

            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

              <p className="text-center text-sm font-bold tracking-widest text-stone-400">
                PROMOTION
              </p>

              <h2 className="mt-2 text-center text-2xl font-bold">
                成りますか？
              </h2>

              <p className="mt-2 text-center text-sm text-stone-500">
                成ると、この駒は成駒として動けるようになります。
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={
                    promote
                  }
                  className="flex-1 rounded-xl bg-stone-800 px-4 py-3 font-bold text-white transition hover:bg-stone-700"
                >
                  成る
                </button>

                <button
                  onClick={
                    doNotPromote
                  }
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-50"
                >
                  成らない
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ====================================
          対局終了モーダル
      ==================================== */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="text-center">

              <p className="text-sm font-bold tracking-widest text-slate-500">
                GAME OVER
              </p>

              <h2 className="mt-2 text-3xl font-bold text-stone-800">
                {winner === 'b'
                  ? '先手の勝ち！'
                  : '後手の勝ち！'}
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                王が取られたため、対局終了です。
              </p>

            </div>

            <button
              onClick={reset}
              className="mt-6 w-full rounded-xl bg-stone-800 px-4 py-3 font-bold text-white transition hover:bg-stone-700"
            >
              もう一度対局する
            </button>

          </div>
        </div>
      )}

    </main>
  );
}

export default App;