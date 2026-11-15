import { toast } from 'react-toastify';

// Named `toastr` so ported legacy call sites keep working with minimal edits.
export const toastr = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
};

export default toastr;
