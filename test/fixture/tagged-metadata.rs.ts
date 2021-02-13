import { numberTag, stringTag, flagTag } from './tagged-metadata-definition.rs'

const taggedMetadata = {
  /**
   * level11-comment
   * @see flagTag
   */
  level11: 'level11-text',
  /**
   * level12-comment
   * @see numberTag 10
   */
  level12: 'level12-text',
  /**
   * level13-comment
   * @see stringTag string tag with spaces
   */
  level13: 'level13-text',
  /**
   * level14-comment
   * @see stringTag string tag with spaces @see flagTag @see numberTag 10
   */
  level14: 'level14-text',
  /**
   * level15-comment
   * @see flagTag @see numberTag 10 @see stringTag string tag with spaces
   */
  level15: 'level15-text',
  /**
   * level16-comment
   * @see flagTag
   * @see numberTag 10
   * @see stringTag string tag with spaces
   */
  level16: 'level16-text',
  /**
   * level17-comment
   * @see numberTag 123.4567
   */
  level17: 'level17-text',
  /**
   * level18-comment
   */
  level18: 'level18-text',
  /**
   * @see numberTag 10
   */
  level19: 'level19-text',
  /**
   * @see
   */
  level110: 'level110-text',
  /**
   * level111-comment-1
   * level111-comment-2
   * @see numberTag 10
   */
  level111: 'level111-text',
  /**
   * @see flagTag @see flagTag2
   */
  level112: 'level112-text',
  /**
   * @see flagTag
   * @see flagTag2
   */
  level113: 'level113-text',
  /**
   * level114-comment
   * @see numberTag 10
   * @see stringTag string tag with spaces
   * @see flagTag
   */
  level114: 'level114-text',
}

export default taggedMetadata
