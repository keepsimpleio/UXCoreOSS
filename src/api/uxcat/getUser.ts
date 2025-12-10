export const getPublicUserInfo = async (username: string | string[]) => {
  const url = `https://uxcat.keepsimple.io/users/${username}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        response: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching public user info:', error);
    throw error;
  }
};
