export default interface Category {
  humanReadableName: string;
  machineName: string;
  topicMachineName: string | null;
  topicHumanReadable: string | null;
}
