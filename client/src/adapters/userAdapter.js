export function transformUserDTOtoVO(userDto) {
  if (!userDto) return undefined

  return {
    id: userDto.id,
    username: userDto.username,
    name: userDto.name ?? userDto.username,
  }
}
