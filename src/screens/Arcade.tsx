import { useGameState } from '../engine/useEngine';
import { BlitzGame } from './arcade/BlitzGame';
import { RainGame } from './arcade/RainGame';
import { SnakeGame } from './arcade/SnakeGame';

/**
 * Chọn trò để chạy.
 *
 * Mỗi trò mount bằng `key` riêng, nên bấm "Chơi lại" hay đổi trò là dựng lại từ đầu
 * chứ không kéo theo bàn cũ.
 */
export function Arcade() {
  const st = useGameState();
  switch (st.arcade) {
    case 'rain':
      return <RainGame key="rain" />;
    case 'snake':
      return <SnakeGame key="snake" />;
    case 'blitz':
      return <BlitzGame key="blitz" />;
    default:
      return null;
  }
}
